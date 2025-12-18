package ch.innuvation.sse.service;

import ch.innuvation.sse.model.Article;
import ch.innuvation.sse.model.HeadlinesResponse;
import ch.innuvation.sse.model.NewsItem;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.List;

@Service
public class NewsApiClient {
    private static final Logger log = LoggerFactory.getLogger(NewsApiClient.class);

    private final RestClient newsApiRestClient;

    // default 60 seconds
    private volatile long pollingIntervalSeconds = 60;

    public NewsApiClient(RestClient newsApiRestClient) {
        this.newsApiRestClient = newsApiRestClient;
    }

    public List<NewsItem> fetchTopHeadlines() {
        log.info("Fetching top headlines from NewsAPI (interval={}s)", pollingIntervalSeconds);

        HeadlinesResponse response = newsApiRestClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/top-headlines")
                        .queryParam("country", "us")
                        .build())
                .retrieve()
                .body(HeadlinesResponse.class);

        if (response == null || response.getArticles() == null) {
            log.warn("No headlines returned from NewsAPI");
            return List.of();
        }

        List<NewsItem> list = new ArrayList<>();
        for (Article article : response.getArticles()) {
            list.add(new NewsItem(
                    article.getTitle(),
                    article.getDescription() != null ? article.getDescription() : "",
                    article.getPublishedAt()
            ));
        }
        log.info("Fetched {} headlines from NewsAPI", list.size());
        return list;
    }

    public long getPollingIntervalSeconds() {
        return pollingIntervalSeconds;
    }

    public void setPollingIntervalSeconds(long pollingIntervalSeconds) {
        log.info("Updating polling interval from {}s to {}s",
                this.pollingIntervalSeconds, pollingIntervalSeconds);
        this.pollingIntervalSeconds = pollingIntervalSeconds;
    }
}
