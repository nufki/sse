package ch.innuvation.sse;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NewsApiClient {
    @Value("${newsapi.key}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    public List<NewsItem> fetchTopHeadlines() {
        String url = "https://newsapi.org/v2/top-headlines?country=us&apiKey=" + apiKey;

        HeadlinesResponse response = restTemplate.getForObject(url, HeadlinesResponse.class);
        return response.getArticles().stream()
                .map(article -> new NewsItem(article.getTitle(),
                        article.getDescription() != null ? article.getDescription() : "",
                        article.getPublishedAt()))
                .collect(Collectors.toList());
    }
}
