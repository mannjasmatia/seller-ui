import moment from "moment";

interface ReturnType {
    isValid: boolean;
    message: string;
}

export const validateFromToDate = (from: string, to: string): ReturnType => {
    if (!moment(from).isValid() || !moment(to).isValid()) {
        return {
            isValid: false,
            message: "Invalid date format",
        };
    }

    if (moment(from).isAfter(moment(Date.now()), "day")) {
        return {
            isValid: false,
            message: "From Date cannot be after Today",
        };
    }

    if (moment(from).isAfter(moment(to), "day")) {
        return {
            isValid: false,
            message: "From Date cannot be after To Date",
        };
    }

    if (moment(to).isBefore(moment(from), "day")) {
        return {
            isValid: false,
            message: "To Date cannot be before From Date",
        };
    }

    return {
        isValid: true,
        message: "",
    };
};
