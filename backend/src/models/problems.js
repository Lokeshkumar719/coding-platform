const mongoose = require('mongoose');
const { init } = require('./user');
const {Schema} = mongoose;

const problemSchema = new Schema({
    title: {
      type: String,
      required: true
    },
    description:{
      type: String,
      required: true
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: true
    },
    tags:{
      enum: ['array', 'linkedList', 'graph', 'dp'],
      type: [String],
      required: true
    },
    visibleTestCases:[
      {
        input:{
          type: String,
          required: true  
        },
        output:{
          type: String,
          required: true  
        },
        explanation:{
          type: String,
          required: true  
        }
      }
    ],
    hiddenTestCases:[
      {
        input:{
          type: String,
          required: true  
        },
        output:{
          type: String,
          required: true  
        }
      }
    ],
    startCode:[
      {
        language:{
          type: String,
          required:true
        },
        initialCode:{
          type: String,
          required:true
        }
      }
    ],
    problemCreator:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    referenceSolution:[
      {
        language:{
          type: String,
          required:true
        },
        completeCode:{
          type: String,
          required:true
        }
      }
    ]
});  

const Problem = mongoose.model('Problem', problemSchema);
module.exports = Problem;