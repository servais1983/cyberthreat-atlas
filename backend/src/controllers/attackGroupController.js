const AttackGroup = require('../models/AttackGroup');
const { validationResult } = require('express-validator');

// Get all attack groups with pagination and filtering
exports.getAllAttackGroups = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    let query = {};
    
    // Apply filters if provided
    if (req.query.name) {
      query.name = { $regex: req.query.name, $options: 'i' };
    }
    
    if (req.query.aliases) {
      query.aliases = { $regex: req.query.aliases, $options: 'i' };
    }
    
    if (req.query.country_of_origin) {
      query.country_of_origin = req.query.country_of_origin;
    }
    
    if (req.query.sponsored_by) {
      query.sponsored_by = { $regex: req.query.sponsored_by, $options: 'i' };
    }
    
    if (req.query.motivation) {
      query.motivation = req.query.motivation;
    }
    
    // Execute query with pagination
    const attackGroups = await AttackGroup.find(query)
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit)
      .populate('associated_malware')
      .populate('known_techniques')
      .populate('targeted_sectors')
      .populate('targeted_regions');
    
    // Get total count for pagination
    const total = await AttackGroup.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: attackGroups.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      },
      data: attackGroups
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

// Get a single attack group by ID
exports.getAttackGroupById = async (req, res) => {
  try {
    const attackGroup = await AttackGroup.findById(req.params.id)
      .populate('associated_malware')
      .populate('known_techniques')
      .populate('targeted_sectors')
      .populate('targeted_regions');
    
    if (!attackGroup) {
      return res.status(404).json({
        success: false,
        message: 'Attack group not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: attackGroup
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

// Create a new attack group
exports.createAttackGroup = async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  
  try {
    // Create new attack group
    const attackGroup = await AttackGroup.create(req.body);
    
    res.status(201).json({
      success: true,
      data: attackGroup
    });
  } catch (error) {
    console.error(error);
    // Check for duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate attack group name or identifier'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Update an attack group
exports.updateAttackGroup = async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  
  try {
    const attackGroup = await AttackGroup.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    if (!attackGroup) {
      return res.status(404).json({
        success: false,
        message: 'Attack group not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: attackGroup
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

// Delete an attack group
exports.deleteAttackGroup = async (req, res) => {
  try {
    const attackGroup = await AttackGroup.findByIdAndDelete(req.params.id);
    
    if (!attackGroup) {
      return res.status(404).json({
        success: false,
        message: 'Attack group not found'
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

// Advanced search for attack groups
exports.searchAttackGroups = async (req, res) => {
  try {
    const { 
      keywords, 
      countries, 
      techniques, 
      timeframe, 
      sectors,
      malware
    } = req.body;
    
    let query = {};
    
    // Search by keywords in name, description, and aliases
    if (keywords && keywords.length > 0) {
      const keywordConditions = keywords.map(keyword => ({
        $or: [
          { name: { $regex: keyword, $options: 'i' } },
          { description: { $regex: keyword, $options: 'i' } },
          { aliases: { $regex: keyword, $options: 'i' } }
        ]
      }));
      
      query.$or = keywordConditions;
    }
    
    // Filter by countries
    if (countries && countries.length > 0) {
      query.country_of_origin = { $in: countries };
    }
    
    // Filter by techniques
    if (techniques && techniques.length > 0) {
      query.known_techniques = { $in: techniques };
    }
    
    // Filter by sectors
    if (sectors && sectors.length > 0) {
      query.targeted_sectors = { $in: sectors };
    }
    
    // Filter by associated malware
    if (malware && malware.length > 0) {
      query.associated_malware = { $in: malware };
    }
    
    // Filter by timeframe (first_seen_year)
    if (timeframe && timeframe.start && timeframe.end) {
      query.first_seen_year = {
        $gte: timeframe.start,
        $lte: timeframe.end
      };
    }
    
    const results = await AttackGroup.find(query)
      .populate('associated_malware')
      .populate('known_techniques')
      .populate('targeted_sectors')
      .populate('targeted_regions');
    
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
