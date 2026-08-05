package com.tourms.packages.entity;

public enum Category {
    ADVENTURE("Adventure"),
    FAMILY("Family"),
    HONEYMOON("Honeymoon"),
    RELIGIOUS("Religious"),
    BEACH("Beach"),
    WILDLIFE("Wildlife"),
    HILL_STATION("Hill Station"),
    DOMESTIC("Domestic"),
    INTERNATIONAL("International");

    private final String displayName;

    Category(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
