'use strict'
const requestService = require('../services/request');
const userService = require('../services/user');
import { REQUEST_STATUS } from '../models/Request.Status';
import { populateRequest, populateRequests } from "../services/bookDetails.service";
const debug = require('debug')('app:requestController')

//todo: fix issue here
const canUpdate = (user,request, proposedStatus) => {
    let canDo = [];
    debug('canUpdate,request.requesting',request.requesting.toString())
    debug('canUpdate,request.receiving',request.receiving.toString())
    debug('canUpdate,user',user.toString())
    canDo = (request.requesting.toString().trim() == user.toString().trim()) && [REQUEST_STATUS.pending, REQUEST_STATUS.accepted,REQUEST_STATUS.declined];
    canDo = (request.receiving.toString().trim() == user.toString().trim()) && [REQUEST_STATUS.approved, REQUEST_STATUS.declined];
    debug('canDo',canDo)
    //return !!(canDo && canDo.find(status => proposedStatus == status));
    return true;
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
        const requestWithData = await populateRequest(request.toObject());
        res.json(requestWithData);
    }

    static async getIncoming(req, res) {
        const incoming = await requestService.getIncoming(req.user._id)
        const incomingWithData = await populateRequests(incoming)
        res.json(incomingWithData);
    }

    static async getOutgoing(req, res) {
        const outgoing = await requestService.getOutgoing(req.user._id)
        const outgoingWithData = await populateRequests(outgoing)
        res.json(outgoingWithData);
    }

    static async create(req, res) {
        const bookDoc = await userService.findBookById(req.body.receiving, req.body.book);
        if(!bookDoc) throw 'book does not exist';
        
        const response = await requestService.create({...req.body, requesting: req.user._id})
        .then(r=>populateRequest(r.toObject()))
        res.json(response);
    }

    static async setRead(req,res) {
        const request = await requestService.getById(req.params.id);
        if (!request) {
            throw 'Request not found!';
        } 
        const user = req.user._id;
        
        const update={}
        if(request.requesting.equals(user)) 
        update['read.requesting']=true;
        else update['read.receiving']=true;
        const response = await requestService.updateById(req.params.id, update)
        res.json(response);
    }

    static async updateStatus(req, res) {
        const request = await requestService.getById(req.params.id);
        if (!request) {
            throw 'Request not found!';
        }
        const user = req.user._id;
        const status = req.body.status;
        if(!canUpdate(user,request,status)) throw 'lack permissions';
        
        if(status == REQUEST_STATUS.accepted) {
            await userService.addBook(request.requesting, request.book);
            await userService.deleteBookById(request.receiving, request.book);
            await userService.updateRating(request.requesting,request.receiving);
        }

        let read;
        if(request.requesting.equals(user)) 
        read={requesting:true,receiving:false};
        else read={requesting:false,receiving:true};

        const update={status,read}
        const response = await requestService.updateById(req.params.id, update)
        // .then(r=>{populateRequest(r.toObject())})
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
        // .then(r=>populateRequest(r.toObject()))
        res.json(response);
    }
    
}
