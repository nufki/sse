package ch.innuvation.sse.service;

import ch.innuvation.sse.model.Article;
import ch.innuvation.sse.model.HeadlinesResponse;
import ch.innuvation.sse.model.NewsItem;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.List;

@Service
public class NewsApiClient {

    private final RestClient newsApiRestClient;

    public NewsApiClient(RestClient newsApiRestClient) {
        this.newsApiRestClient = newsApiRestClient;
    }

    public List<NewsItem> fetchTopHeadlines() {
        HeadlinesResponse response = newsApiRestClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/top-headlines")
                        .queryParam("country", "us")
                        .build())
                .retrieve()
                .body(HeadlinesResponse.class);

        if (response == null || response.getArticles() == null) {
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
        return list;
    }
}
