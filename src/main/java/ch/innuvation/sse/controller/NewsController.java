package ch.innuvation.sse.controller;

import ch.innuvation.sse.model.NewsItem;
import ch.innuvation.sse.service.NewsApiClient;
import jakarta.annotation.PostConstruct;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@RestController
public class NewsController {
    private final SseEmitter sseEmitter = new SseEmitter(Long.MAX_VALUE);
    private final NewsApiClient newsApiClient;
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);

    public NewsController(NewsApiClient newsApiClient) {
        this.newsApiClient = newsApiClient;
    }

    @PostConstruct
    public void initNewsPolling() {
        scheduler.scheduleAtFixedRate(() -> {
            try {
                List<NewsItem> headlines = newsApiClient.fetchTopHeadlines();
                headlines.forEach(this::dispatchNewsItem);
            } catch (Exception e) {
                // log error
            }
        }, 0, 60, TimeUnit.SECONDS);
    }

    @GetMapping("/news")
    public SseEmitter getNews() {
        return sseEmitter;
    }

    private void dispatchNewsItem(NewsItem item) {
        try {
            sseEmitter.send(SseEmitter.event()
                    .name("NEWS")
                    .data(item));
        } catch (IOException e) {
            sseEmitter.complete();
        }
    }
}
