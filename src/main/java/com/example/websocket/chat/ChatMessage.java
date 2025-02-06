package com.example.websocket.chat;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ChatMessage { // Класс - сообщение и его содержимое

    private MessageType type;
    private String content;
    private String sender;

}
