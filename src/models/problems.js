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
      enum: ['Easy', 'Medium', 'Hard'],
      required: true
    },
    tags:{
      enum: ['Array', 'String', 'Dynamic Programming', 'Graph', 'Tree', 'Math', 'Greedy', 'Backtracking', 'Hash Table', 'Two Pointers', 'Sliding Window', 'Divide and Conquer'],
      type: [String],
      required: true
    },
    visibleTestcases:[
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
    hiddenTestcases:[
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