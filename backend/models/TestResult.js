const mongoose = require('mongoose');

const testResultSchema = new mongoose.Schema({
    // Informații despre test
    testTitle: {
        type: String,
        default: 'Test Grilă'
    },
    
    // Informații despre elev
    studentName: {
        name: {
            type: String,
            required: false
        },
        confidence: {
            type: Number,
            default: 0
        },
        success: {
            type: Boolean,
            default: false
        }
    },
    
    // Rezultate evaluare
    correctAnswers: {
        type: Number,
        required: true
    },
    
    totalQuestions: {
        type: Number,
        required: true
    },
    
    // Matrici răspunsuri
    baremMatrix: {
        type: [[Number]],
        required: true
    },
    
    elevMatrix: {
        type: [[Number]],
        required: true
    },
    
    // Detalii pe întrebări
    details: [{
        question: Number,
        status: {
            type: String,
            enum: ['CORRECT', 'WRONG']
        },
        barem: [Number],
        elev: [Number]
    }],
    
    // Imagine cu rezultate (base64)
    resultImage: {
        type: String,
        required: false
    },
    
    // Metadata
    timestamp: {
        type: Date,
        default: Date.now
    },
    
    processingTime: {
        type: Number, // milliseconds
        required: false
    }
}, {
    timestamps: true
});

testResultSchema.index({ timestamp: -1 });
testResultSchema.index({ 'studentName.name': 1 });
testResultSchema.index({ testTitle: 1 });

// Method pentru formatarea rezultatului
testResultSchema.methods.getFormattedResult = function() {
    return {
        id: this._id,
        testTitle: this.testTitle,
        studentName: this.studentName.name || 'Nu s-a detectat',
        score: `${this.correctAnswers}/${this.totalQuestions}`,
        date: this.timestamp.toLocaleDateString('ro-RO'),
        time: this.timestamp.toLocaleTimeString('ro-RO')
    };
};

module.exports = mongoose.model('TestResult', testResultSchema);