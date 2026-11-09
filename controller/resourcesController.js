const mongoose = require ('mongoose');
const Resource = require('../model/resourceModel');


const getAllResources = async (req,res) =>{
    try{
    const resources = await Resource.find({status: 'approved'});
    return res.status(200).json({
        count: resources.length,
        resources
    });
    }catch (error){
       return  res.status(500).json({
        message: "Failed to retrieve resources",
        error: error.message
       })
    }

};

const getOneResource = async (req,res) =>{
    try{
           if(!mongoose.isValidObjectId(req.params.id)){
            return res.status(400).json({
                message: 'Invalid resource ID'
            })
        }
        const resource = await Resource.findById(req.params.id)
        if(!resource){
           return res.status(404).json({
                message: 'Resource Not Found'
            });
        }

        if(resource.status !== 'approved'){
            return res.status(404).json({
                message: 'Resource Not Found'
            });
        }

        return res.status(200).json({
            resource
        })
    }
    catch(error){
       return res.status(500).json({
            message: 'Failed to retrieve resource',
            error: error.message
        });
    }
}

const createResource = async (req,res) =>{
   
   try{
     if(!req.body || 
        typeof req.body !== 'object' || Array.isArray(req.body)
    ){
       return res.status(400).json({
            message: 'Invalid request body'
        })
    }

     const {
        title,
        url,
        type,
        recommendation,
        creator,
        length,
        description,
        field,
        submittedBy,
        country
    } = req.body;

    const resource = await Resource.create({
        title,
        url,
        type,
        recommendation,
        creator,
        length,
        description,
        field,
        submittedBy,
        country,
        status: 'pending'
    });

    res.status(201).json({
        message: 'Resource Submitted Successfully',
        resource
    });
   }
   catch(error){
    return res.status(500).json({
        message: 'Failed To Create Resource',
        error: error.message
    })
   }
}

const deleteResource = async (req,res) => {
    try{
        if(!mongoose.isValidObjectId(req.params.id)){
            return res.status(400).json({
                message: 'Invalid resource ID'
            })
        }
        const resource = await Resource.findByIdAndDelete(req.params.id);


        if(!resource){
            return res.status(404).json({
                message: 'Resource Not Found'
            });
        }
        return res.status(204).send();

    }catch(error){
       return res.status(500).json({
            message: 'Resource Deletion Failed',
            error: error.message
        })
    }
}

module.exports = {
    getAllResources,
    getOneResource,
    createResource,
    deleteResource
};