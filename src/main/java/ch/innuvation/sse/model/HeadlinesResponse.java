package ch.innuvation.sse.model;

import java.util.List;

public class HeadlinesResponse {
    private List<Article> articles;

    public void setArticles(List<Article> articles) {
        this.articles = articles;
    }

    public List<Article> getArticles() {
        return articles;
    }
    // getters/setters
}
