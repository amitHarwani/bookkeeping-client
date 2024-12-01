import {delay, http, HttpResponse} from "msw";
import { ApiResponse } from "@/services/api_response";
import { LoginResponse } from "@/services/user/user_types";
import user_service from "@/services/user/user_service";

export const handlers = [
    http.post(`${process.env?.["EXPO_PUBLIC_USER_SERVICE"]}/${user_service.loginPath}`, async ({request, params}) => {
        await delay();
        return HttpResponse.json(
            new ApiResponse(200, new LoginResponse({
            fullName: "user1",
            email: "user1@test.com",
            password: "password",
            countryId: 1,
            mobileNumber: "+971505555555",
            isSubUser: false,
            userId: "user1",
            refreshToken: "refresh_token",
            isLoggedIn: true,
            isActive: true,
            createdAt: new Date("2024-01-11 08:00:00"),
            updatedAt: new Date("2024-01-11 08:00:00")
        }, "access_token", "refresh_token"), true), {status: 200})
    })
]