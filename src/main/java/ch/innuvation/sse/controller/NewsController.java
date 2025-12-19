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
import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@RestController
public class NewsController {

    private static final Logger log = LoggerFactory.getLogger(NewsController.class);

    private final NewsApiClient newsApiClient;
    private final ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor();
    private final List<SseEmitter> emitters = new CopyOnWriteArrayList<>(); // Thread-safe

    public NewsController(NewsApiClient newsApiClient) {
        this.newsApiClient = newsApiClient;
    }

    @PostConstruct
    public void initNewsPolling() {
        log.info("Initializing news polling");
        scheduleNextPoll(0);
    }

    private void scheduleNextPoll(long delaySeconds) {
        scheduler.schedule(() -> {
            long currentInterval = newsApiClient.getPollingIntervalSeconds();
            log.info("Running news poll (interval={}s, {} clients)", currentInterval, emitters.size());
            try {
                List<NewsItem> headlines = newsApiClient.fetchTopHeadlines();
                log.info("Dispatching {} headlines to {} SSE clients", headlines.size(), emitters.size());
                // For each headline → calls dispatchNewsItem(item)
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
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);
        log.info("Client connected to /news SSE stream (total clients: {})", emitters.size() + 1);

        emitters.add(emitter);

        // Send immediate data using your existing method
        try {
            List<NewsItem> headlines = newsApiClient.fetchTopHeadlines();
            headlines.forEach(item -> dispatchNewsItemToSingle(item, emitter));  // Immediate!
            log.info("Sent {} cached headlines to new client", headlines.size());
        } catch (Exception e) {
            log.warn("Failed initial data send", e);
        }

        emitter.onCompletion(() -> {
            emitters.remove(emitter);
            log.info("Client disconnected (remaining: {})", emitters.size());
        });
        emitter.onTimeout(() -> {
            emitters.remove(emitter);
            log.info("Client timeout (remaining: {})", emitters.size());
        });
        emitter.onError((ex) -> {
            emitters.remove(emitter);
            log.warn("Client error", ex);
        });

        return emitter;
    }

    private void dispatchNewsItemToSingle(NewsItem item, SseEmitter singleEmitter) {
        try {
            singleEmitter.send(SseEmitter.event()
                    .name("NEWS")
                    .data(item));
        } catch (IOException e) {
            log.debug("Failed initial send to new client");
            singleEmitter.complete();
        }
    }

    private void dispatchNewsItem(NewsItem item) {
        emitters.forEach(emitter -> {  // 1. Loop all active clients
            try {
                emitter.send(SseEmitter.event()  // 2. Send formatted SSE event
                        .name("NEWS")
                        .data(item));            // 3. With news headline data → Broadcasts to all clients → every connected browser gets the update

            } catch (IOException e) {            // 4. Remove dead clients → Handles disconnects → removes emitters that can't receive
                log.debug("Failed to send to client, removing");
                emitter.complete();
            }
        });
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
    public Map<String, Long> getPollingInterval() {
        return Map.of("pollingIntervalSeconds", newsApiClient.getPollingIntervalSeconds());
    }

    @GetMapping("/clients")
    public Map<String, Integer> getClientCount() {
        return Map.of("activeClients", emitters.size());
    }
}
