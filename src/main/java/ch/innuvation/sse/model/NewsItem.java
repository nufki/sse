package ch.innuvation.sse.model;

public class NewsItem {
    private String title;
    private String content;
    private String timestamp;

    public NewsItem(String title, String description, String publishedAt) {
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
