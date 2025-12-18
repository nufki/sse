package ch.innuvation.sse.controller;

import ch.innuvation.sse.model.NewsItem;
import ch.innuvation.sse.service.NewsApiClient;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@RestController
public class NewsController {

    private static final Logger log = LoggerFactory.getLogger(NewsController.class);

    private final SseEmitter sseEmitter = new SseEmitter(Long.MAX_VALUE);
    private final NewsApiClient newsApiClient;
    private final ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor();

    public NewsController(NewsApiClient newsApiClient) {
        this.newsApiClient = newsApiClient;
    }

    @PostConstruct
    public void initNewsPolling() {
        log.info("Initializing news polling");
        scheduleNextPoll(0); // start immediately
    }

    private void scheduleNextPoll(long delaySeconds) {
        scheduler.schedule(() -> {
            long currentInterval = newsApiClient.getPollingIntervalSeconds();
            log.info("Running news poll (interval={}s)", currentInterval);
            try {
                List<NewsItem> headlines = newsApiClient.fetchTopHeadlines();
                log.info("Dispatching {} headlines to SSE clients", headlines.size());
                headlines.forEach(this::dispatchNewsItem);
            } catch (Exception e) {
                log.error("Error while polling or dispatching news", e);
            } finally {
                long nextDelay = newsApiClient.getPollingIntervalSeconds();
                log.info("Scheduling next poll in {}s", nextDelay);
                scheduleNextPoll(nextDelay);
            }
        }, delaySeconds, TimeUnit.SECONDS);
    }

    @GetMapping("/news")
    public SseEmitter getNews() {
        log.info("Client connected to /news SSE stream");
        return sseEmitter;
    }

    private void dispatchNewsItem(NewsItem item) {
        try {
            sseEmitter.send(SseEmitter.event()
                    .name("NEWS")
                    .data(item));
        } catch (IOException e) {
            log.warn("Error sending SSE event, completing emitter", e);
            sseEmitter.complete();
        }
    }

    @PostMapping("/config/polling-interval")
    public void updatePollingInterval(@RequestParam("seconds") long seconds) {
        if (seconds < 10 || seconds > 60) {
            log.warn("Rejected polling interval {}s (must be 10–60)", seconds);
            throw new IllegalArgumentException("Interval must be between 10 and 60 seconds");
        }
        newsApiClient.setPollingIntervalSeconds(seconds);
    }

    @GetMapping("/config/polling-interval")
    public long getPollingInterval() {
        return newsApiClient.getPollingIntervalSeconds();
    }
}
