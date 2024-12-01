import "../../mocks/msw.polyfills";
import { render, userEvent, waitFor } from "@testing-library/react-native";
import Login from "./login";
import { Provider } from "react-redux";
import store from "@/store";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../_layout";
import { router } from "expo-router";
import { AppRoutes } from "@/constants/routes";
import { server } from "@/mocks/server";



const user = userEvent.setup();
describe("Login", () => {
    beforeAll(() => {
        server.listen();
    })
    beforeEach(() => {
        server.resetHandlers()
    })
    afterAll(() => {
        server.close();
    })
    it("renders correctly", async () => {
        const { getByPlaceholderText, getByRole, getByText, getAllByText, queryByRole, debug } = render(
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    <Login />
                </Provider>
            </QueryClientProvider>
        );
        
        const emailInput = getByPlaceholderText(/enter email/i);
        const passwordInput = getByPlaceholderText(/enter password/i);

        await user.type(emailInput, "user1@test.com");
        await user.type(passwordInput, "password");

        const routerReplaceMethod = jest.spyOn(router, "replace").mockImplementation(jest.fn());

        const loginButton = getByRole("button", {name: /login/i});   

        await user.press(loginButton);
        expect(queryByRole("progressbar")).toBeDefined();


        await waitFor(() => expect(queryByRole("progressbar")).toBeNull());
        
        await waitFor(() => expect(routerReplaceMethod).toHaveBeenCalled());
        expect(routerReplaceMethod).toHaveBeenCalledWith(AppRoutes.viewAllCompanies);
        
        
    });
});
