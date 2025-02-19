const firSchema = new mongoose.Schema({
    fir_id: {
        type: Number,
        unique: true,
        required: true
    },
    complaint: {
       type: mongoose.Schema.Types.objectId,
       ref:'Complaint',
        required: true
    },
    sections: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.objectId,
        ref:'User',
        required: true,
    },
    status: {
        type: String,
        required: true,
        enum: ['Open', 'In Progress', 'Closed']
    }
}, { timestamps: true });

const FIR = mongoose.model('FIR', firSchema);

module.exports = FIR ;
