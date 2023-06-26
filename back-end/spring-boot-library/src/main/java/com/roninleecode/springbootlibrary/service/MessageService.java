package com.roninleecode.springbootlibrary.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.roninleecode.springbootlibrary.dao.MessageRepository;
import com.roninleecode.springbootlibrary.entity.Message;
import com.roninleecode.springbootlibrary.requestmodels.AdminQuestionRequest;

@Service
@Transactional
public class MessageService {
	
	private MessageRepository messageRepository;
	
	@Autowired
	public MessageService(MessageRepository messageRepository) {
		
		this.messageRepository = messageRepository;
	}
	
	public void postMessage(Message messageRequest, String userEmail) {
		Message message = new Message(messageRequest.getTitle(), messageRequest.getQuestion());
		
		message.setClosed(false);
		message.setUserEmail(userEmail);
		messageRepository.save(message);
	}
	
	public void putMessage(AdminQuestionRequest adminQuestionRequest, String userEmail) throws Exception {
		Optional<Message> message=  messageRepository.findById(adminQuestionRequest.getId());
		
		if(!message.isPresent()) {
			throw new Exception("Message not found");
		}
		
		message.get().setAdminEmail(userEmail);
		message.get().setResponse(adminQuestionRequest.getResponse());
		message.get().setClosed(true);
		
		messageRepository.save(message.get());
		
	}
}