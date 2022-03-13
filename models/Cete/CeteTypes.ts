export type CeteDict = {
    id: string,
    userId: string,
    timestamp: Date,
    data: {
        audioData: string,
        filepath: string
    },
    isArchived: boolean,
    listens: number
};

export type CeteDictIndexing = {
    id: string,
    userId: string,
    timestamp: Date,
    data: {
        filepath: string
    },
    isArchived: boolean,
    listens: number
};

export type CeteDictProfile = {
    id: string,
    userId: string,
    timestamp: Date,
    isArchived: boolean,
    listens: number
};

export type CeteDictWithData = {
    id: string,
    userId: string,
    timestamp: Date,
    data: {
        audioData: string,
    },
    isArchived: boolean,
    listens: number
};