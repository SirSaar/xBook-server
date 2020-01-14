'use strict'
const requestService = require('../services/request');
const userService = require('../services/user');
import { REQUEST_STATUS } from '../models/Request.Status';
import { populateRequest, populateRequests } from "../services/bookDetails.service";

const canUpdate = (user,request, proposedStatus) => {
    let canDo = [];
    canDo = request.requesting == user && [REQUEST_STATUS.pending, REQUEST_STATUS.accepted];
    canDo = request.receiving == user && [REQUEST_STATUS.approved, REQUEST_STATUS.declined];
    return !!canDo.find(status => proposedStatus == status);
}

const canDelete = (user,request) => !(request.requesting == user);

const isOwner = (user,request) => !(request.requesting == user || request.receiving == user);

module.exports = class requestController {

    static async getById(req, res) {
        const request = await requestService.getById(req.params.id);
        if (!request) {
            throw 'Request not found!';
        }
        const user = req.user._id;
        if(isOwner(user,request)) {
            throw 'Request does not belong to you!';
        }
        const requestWithData = await populateRequest(request);
        res.json(requestWithData);
    }

    static async getIncoming(req, res) {
        const response = await requestService.getIncoming(req.user._id)
        .then(populateRequests)
        res.json(response);
    }

    static async getOutgoing(req, res) {
        const response = await requestService.getOutgoing(req.user._id)
        .then(populateRequests)
        res.json(response);
    }

    static async create(req, res) {
        const bookDoc = await userService.findBookById(req.body.receiving, req.body.book);
        if(!bookDoc) throw 'book does not exist';
        
        const response = await requestService.create({...req.body, requesting: req.user._id})
        .then(populateRequest)
        res.json(response);
    }

    static async updateById(req, res) {
        const request = await requestService.getById(req.params.id);
        if (!request) {
            throw 'Request not found!';
        }
        const user = req.user._id;
        if(!canUpdate(user,request,req.body.status)) throw 'lack permissions';

        if(req.body.status == REQUEST_STATUS.accepted) {
            await userService.addBook(request.requesting, request.book);
            await userService.deleteBookById(request.receiving, request.book);
        }
        const response = await requestService.updateById(req.params.id, req.body)
        .then(populateRequest)
        res.json(response);
    }

    static async deleteById(req, res) {
        const request = await requestService.getById(req.params.id);
        if (!request) {
            throw 'Request not found!';
        }
        const user = req.user._id;
        if(canDelete(user,request)) {
            throw 'Request does not belong to you!';
        }

        const response = await requestService.deleteById(req.params.id)
        .then(populateRequest)
        res.json(response);
    }
    
}
