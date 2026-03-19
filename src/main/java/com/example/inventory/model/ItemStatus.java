package com.example.inventory.model;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum ItemStatus {
    LOANED,
    ON_ROOM;

    @JsonCreator
    public static ItemStatus fromValue(String value) {
        if (value == null) return ON_ROOM;
        for (ItemStatus s : values()) {
            if (s.name().equalsIgnoreCase(value)) return s;
        }
        // Legacy frontend values (AVAILABLE, IN_USE) map to ON_ROOM
        return ON_ROOM;
    }
}
