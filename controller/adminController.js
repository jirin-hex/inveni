const mongoose = require ('mongoose');
const Resource = require('../model/resourceModel');

const getDashboardStats = async (req,res) => {
    try{
        const total = await Resource.countDocuments();
        const pending = await Resource.countDocuments({status: 'pending'});
        const approved = await Resource.countDocuments({status: 'approved'});
       const countries = await Resource.distinct('country', {
                                country: { $exists: true, $nin: [null, ''] }
                            });
        const countryCount = countries.length;
        return res.status(200).json({
          total,pending,approved,countryCount
        })

    }
    catch(error){
      return  res.status(500).json({
            message: 'Failed to recieve stats',
            error: error.message
        });
    }
}

const getAllResources = async (req,res) =>{
    try{
        const {status} = req.query;
        const filter = status ? {status} : {};

        const resources = await Resource.find(filter);

        return res.status(200).json({
            message: 'Resources retrieved successfully',
            count: resources.length,
            resources
        })

    } catch(error){
        return res.status(500).json({
            message: 'Failed to retrieve resources',
            error: error.message
        });

    }
}

const getOneResource = async (req,res) => {
    try{

        if(!mongoose.isValidObjectId(req.params.id)){
            return res.status(400).json({
                message: 'Invalid Resource Id'
            })
        }

        const resource = await Resource.findById(req.params.id);
        if(!resource){
            return res.status(404).json({
                message: 'Resource Not found',
            })
        }
        return res.status(200).json({
            message: 'Resource Successfully Retrieved',
            resource
        })

    }catch(error){
        return res.status(500).json({
            message: 'Failed to retrieve resource',
            error: error.message
        })
    }
}

const UpdateResourceStatus = async (req,res) =>{
       
    try{
        const {id} = req.params;
        if(!mongoose.isValidObjectId(id)){
            return res.status(400).json({
                message: 'Invalid Resource Id'
            })
        }
        const {status} = req.body;
        const validStatuses = ['pending','approved','rejected'];
        if(!validStatuses.includes(status)){
            return res.status(400).json({
                message: 'Invalid resource status'
            })
        }





        const updateStatus = await Resource.findByIdAndUpdate(id,{status},{new: true, runValidators: true});
        if(!updateStatus){
            return res.status(404).json({
                message: 'Resource not found'
            })
        }
        return res.status(200).json({
            message: 'Resource status updated successfully',
            updateStatus
        })

    }catch(error){
        return res.status(500).json({
            message: 'Failed to Update resource',
            error: error.message
        })
    }
}

const deleteResource = async (req,res) =>{
    try{
        if(!mongoose.isValidObjectId(req.params.id)){
            return res.status(400).json({
                message: 'Invalid Resource Id'
            })
        }
        const deleteOne = await Resource.findByIdAndDelete(req.params.id);
    if(!deleteOne){
        return res.status(404).json({
            message: 'Resource does not exist',
        })
    }
      return res.status(204).send()
    }catch(error){
        return res.status(500).json({
            message: 'Failed to delete resource',
            error: error.message
        })
    }
}

const getCountryStats = async (req,res) => {
    try{
      const  countryStats = await Resource.aggregate([
            {
                $match: {
                    country: {$exists: true, $nin:[null,'']}
                }
            },
            {
                $group: {
                    _id: '$country',
                    count: {$sum: 1}
                }
            },
            {
                $sort: {
                    count: -1
                }
            }
        ]);
        res.status(200).json({
            message: 'Country Stats Successfully Fetched',
            countryStats
        })
    }catch(error){
        return res.status(500).json({
            message: 'Failed to get Country Stats',
            error: error.message
        })
    }
}

module.exports = {
    getDashboardStats,
    getAllResources,
    getOneResource,
    UpdateResourceStatus,
    deleteResource,
    getCountryStats
}