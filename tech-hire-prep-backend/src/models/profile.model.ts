import mongoose, { HydratedDocument, Model, Schema, model } from "mongoose";
import { ExperienceLevel, INotificationPreference, IPreferences, IProfile, PreferredLanguage, TargetRole, WeekDay } from "../types/profile.types.ts";

/* ===========================
   SUB SCHEMAS
=========================== */

const SocialLinksSchema = new Schema({
    github: String,
    linkedin: String,
    portfolio: String,
    leetcode: String,
    codeforces: String,
    codechef: String,
    geeksforgeeks: String,
    hackerEarth: String,
    hackerRank: String,
},
    {
        _id: false,
    }
);

const NotificationPreferenceSchema = new Schema<INotificationPreference>({
    email: {
        type: Boolean,
        default: true,
    },
},
    {
        _id: false,
    }
);

const PreferencesSchema = new Schema<IPreferences>({
    language: {
        type: String,
        enum: Object.values(PreferredLanguage),
        default: PreferredLanguage.ENGLISH,
    },

    notifications: {
        type: NotificationPreferenceSchema,
        default: () => ({}),
    },
},
    {
        _id: false,
    }
);

const AvailabilitySchema = new Schema({
    day: {
        type: String,
        enum: Object.values(WeekDay),
        required: true,
    },

    startTime: {
        type: String,
        required: true,
    },

    endTime: {
        type: String,
        required: true,
    },
},
    {
        _id: false,
    }
);

/* ===========================
   PROFILE SCHEMA
=========================== */

const ProfileSchema = new Schema<IProfile>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
    },

    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        minlength: 3,
        maxlength: 30,
    },

    headline: {
        type: String,
        trim: true,
        maxlength: 120,
    },

    bio: {
        type: String,
        trim: true,
        maxlength: 500,
    },

    college: {
        type: String,
        trim: true,
    },

    branch: {
        type: String,
        trim: true,
    },

    graduationYear: {
        type: Number,
        min: 2000,
        max: 2100,
    },

    targetRole: {
        type: String,
        enum: Object.values(TargetRole),
        required: true,
    },

    experienceLevel: {
        type: String,
        enum: Object.values(ExperienceLevel),
        required: true,
    },

    skills: {
        type: [String],
        default: [],
    },

    socialLinks: {
        type: SocialLinksSchema,
        default: () => ({}),
    },

    preferences: {
        type: PreferencesSchema,
        default: () => ({}),
    },

    availability: {
        type: [AvailabilitySchema],
        default: [],
    },

    profileCompletion: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
    },

    isProfileCompleted: {
        type: Boolean,
        default: false,
    },
},
    {
        timestamps: true,
        versionKey: false,
        strict: "throw",
    }
);

/* ===========================
   INDEXES
=========================== */

ProfileSchema.index({ username: 1 }, { unique: true });

ProfileSchema.index({ userId: 1 }, { unique: true });

ProfileSchema.index({
    targetRole: 1,
    experienceLevel: 1,
});

ProfileSchema.index({
    skills: 1,
});

ProfileSchema.index({
    college: 1,
});


export type ProfileDocument = HydratedDocument<IProfile>;

/* ===========================
   MODEL
=========================== */

export const Profile: Model<IProfile> = mongoose.models.Profile ?? model<IProfile>("Profile", ProfileSchema);