package com.constructionrental.system.common.exception;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDateTime;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class ErrorResponse {
    private boolean success;
    private int status;
    private String error;
    private String message;
    private String path;
    private List<String> errors;
    private LocalDateTime timestamp;

    public ErrorResponse() {
        this.success = false;
        this.timestamp = LocalDateTime.now();
    }

    public ErrorResponse(String message) {
        this.success = false;
        this.message = message;
        this.timestamp = LocalDateTime.now();
    }

    public ErrorResponse(int status, String error, String message, String path) {
        this.success = false;
        this.status = status;
        this.error = error;
        this.message = message;
        this.path = path;
        this.timestamp = LocalDateTime.now();
    }

    public ErrorResponse(int status, String error, String message, String path, List<String> errors) {
        this.success = false;
        this.status = status;
        this.error = error;
        this.message = message;
        this.path = path;
        this.errors = errors;
        this.timestamp = LocalDateTime.now();
    }

    public ErrorResponse(String message, List<String> errors) {
        this.success = false;
        this.message = message;
        this.errors = errors;
        this.timestamp = LocalDateTime.now();
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public int getStatus() {
        return status;
    }

    public void setStatus(int status) {
        this.status = status;
    }

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public List<String> getErrors() {
        return errors;
    }

    public void setErrors(List<String> errors) {
        this.errors = errors;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
