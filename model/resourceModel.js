// const express = require('express');
const mongoose = require('mongoose');
const { model } = require('mongoose');
const resourceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    url:{
        type: String,
        required: true
    },
    type:{
        type: String,
        required: true
    },
    recommendation:{
        type: String,
        required: true
    },
    creator:{
        type: String,
        required: true
    },
    length:{
        type: String,
        required: true
    },
    description:{
        type: String,
        required: true
    },
    field:{
        type: String,
        required: true,
    },
    country:{
        type: String,
        trim: true,
        required: true
    },
    status:{
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    submittedBy: String,

})

const Resource = mongoose.model('Resource', resourceSchema);
module.exports = Resource;