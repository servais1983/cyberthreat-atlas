const Campaign = require('../models/Campaign');
const { validationResult } = require('express-validator');

// Get all campaigns with pagination and filtering
exports.getAllCampaigns = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    let query = {};
    
    // Apply filters if provided
    if (req.query.name) {
      query.name = { $regex: req.query.name, $options: 'i' };
    }
    
    if (req.query.attack_group) {
      query.attack_group = req.query.attack_group;
    }
    
    if (req.query.start_date) {
      query.start_date = { $gte: new Date(req.query.start_date) };
    }
    
    if (req.query.end_date) {
      query.end_date = { $lte: new Date(req.query.end_date) };
    }
    
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    if (req.query.severity) {
      query.severity = req.query.severity;
    }
    
    if (req.query.targeted_sector) {
      query.targeted_sectors = req.query.targeted_sector;
    }
    
    if (req.query.targeted_region) {
      query.targeted_regions = req.query.targeted_region;
    }
    
    // Execute query with pagination
    const campaigns = await Campaign.find(query)
      .sort({ start_date: -1 })
      .skip(skip)
      .limit(limit)
      .populate('attack_group')
      .populate('techniques_used')
      .populate('malware_used')
      .populate('targeted_sectors')
      .populate('targeted_regions')
      .populate('indicators');
    
    // Get total count for pagination
    const total = await Campaign.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: campaigns.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      },
      data: campaigns
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Get a single campaign by ID
exports.getCampaignById = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id)
      .populate('attack_group')
      .populate('techniques_used')
      .populate('malware_used')
      .populate('targeted_sectors')
      .populate('targeted_regions')
      .populate('indicators');
    
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: campaign
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Create a new campaign
exports.createCampaign = async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  
  try {
    // Create new campaign
    const campaign = await Campaign.create(req.body);
    
    res.status(201).json({
      success: true,
      data: campaign
    });
  } catch (error) {
    console.error(error);
    // Check for duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate campaign name or identifier'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Update a campaign
exports.updateCampaign = async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  
  try {
    const campaign = await Campaign.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: campaign
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Delete a campaign
exports.deleteCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findByIdAndDelete(req.params.id);
    
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Advanced search for campaigns
exports.searchCampaigns = async (req, res) => {
  try {
    const { 
      keywords, 
      attackGroups, 
      techniques, 
      timeframe, 
      sectors,
      regions,
      malware,
      severity,
      status
    } = req.body;
    
    let query = {};
    
    // Search by keywords in name and description
    if (keywords && keywords.length > 0) {
      const keywordConditions = keywords.map(keyword => ({
        $or: [
          { name: { $regex: keyword, $options: 'i' } },
          { description: { $regex: keyword, $options: 'i' } }
        ]
      }));
      
      query.$or = keywordConditions;
    }
    
    // Filter by attack groups
    if (attackGroups && attackGroups.length > 0) {
      query.attack_group = { $in: attackGroups };
    }
    
    // Filter by techniques
    if (techniques && techniques.length > 0) {
      query.techniques_used = { $in: techniques };
    }
    
    // Filter by sectors
    if (sectors && sectors.length > 0) {
      query.targeted_sectors = { $in: sectors };
    }
    
    // Filter by regions
    if (regions && regions.length > 0) {
      query.targeted_regions = { $in: regions };
    }
    
    // Filter by malware
    if (malware && malware.length > 0) {
      query.malware_used = { $in: malware };
    }
    
    // Filter by severity
    if (severity && severity.length > 0) {
      query.severity = { $in: severity };
    }
    
    // Filter by status
    if (status && status.length > 0) {
      query.status = { $in: status };
    }
    
    // Filter by timeframe
    if (timeframe) {
      if (timeframe.start) {
        query.start_date = { ...query.start_date, $gte: new Date(timeframe.start) };
      }
      
      if (timeframe.end) {
        query.end_date = { ...query.end_date, $lte: new Date(timeframe.end) };
      }
    }
    
    const results = await Campaign.find(query)
      .populate('attack_group')
      .populate('techniques_used')
      .populate('malware_used')
      .populate('targeted_sectors')
      .populate('targeted_regions')
      .populate('indicators');
    
    res.status(200).json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Get timeline of campaigns
exports.getCampaignTimeline = async (req, res) => {
  try {
    const { start_date, end_date, attack_group, sectors, regions } = req.query;
    
    let query = {};
    
    if (start_date) {
      query.start_date = { $gte: new Date(start_date) };
    }
    
    if (end_date) {
      query.end_date = { $lte: new Date(end_date) };
    }
    
    if (attack_group) {
      query.attack_group = attack_group;
    }
    
    if (sectors) {
      const sectorArray = sectors.split(',');
      query.targeted_sectors = { $in: sectorArray };
    }
    
    if (regions) {
      const regionArray = regions.split(',');
      query.targeted_regions = { $in: regionArray };
    }
    
    const campaigns = await Campaign.find(query)
      .select('name description start_date end_date status severity attack_group targeted_regions')
      .populate('attack_group', 'name country_of_origin')
      .populate('targeted_regions', 'name code');
    
    // Format the data for timeline visualization
    const timelineData = campaigns.map(campaign => ({
      id: campaign._id,
      name: campaign.name,
      description: campaign.description,
      start: campaign.start_date,
      end: campaign.end_date || new Date(), // Use current date if still ongoing
      status: campaign.status,
      severity: campaign.severity,
      attack_group: campaign.attack_group ? {
        id: campaign.attack_group._id,
        name: campaign.attack_group.name,
        country: campaign.attack_group.country_of_origin
      } : null,
      regions: campaign.targeted_regions.map(region => ({
        id: region._id,
        name: region.name,
        code: region.code
      }))
    }));
    
    res.status(200).json({
      success: true,
      count: timelineData.length,
      data: timelineData
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};
