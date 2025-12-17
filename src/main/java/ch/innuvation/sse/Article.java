package ch.innuvation.sse;

import java.util.List;

class Article {
    private String title;
    private String description;
    private String publishedAt;


    public String getTitle() {
        return title;
    }
    public void setTitle(String title) {
        this.title = title;
    }
    public String getDescription() {
        return description;
    }
    public void setDescription(String description) {
        this.description = description;
    }
    public String getPublishedAt() {
        return publishedAt;
    }
    public void setPublishedAt(String publishedAt) {
        this.publishedAt = publishedAt;
    }
    // getters/setters
}

class NewsItem {
    private String title;
    private String content;
    private String timestamp;

    NewsItem(String title, String description, String publishedAt) {
        this.title = title;
        this.content = description;
        this.timestamp = publishedAt;
    }

    // constructors, getters/setters
    public String getTitle() {
        return title;
    }
    public void setTitle(String title) {
        this.title = title;
    }
    public String getContent() {
        return content;
    }
    public void setContent(String content) {
        this.content = content;
    }
    public String getTimestamp() {
        return timestamp;
    }
    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }
}

class HeadlinesResponse {
    private List<Article> articles;

    public void setArticles(List<Article> articles) {
        this.articles = articles;
    }
    public List<Article> getArticles() {
        return articles;
    }
    // getters/setters
}

