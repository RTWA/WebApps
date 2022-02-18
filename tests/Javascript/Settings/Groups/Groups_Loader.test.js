import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { act, fireEvent, render, screen, waitForElementToBeRemoved, waitFor } from '@testing-library/react';
import { WebApps } from 'webapps-react';

import UsersGroups from '../../../../resources/js/components/Routes/Settings/UsersGroups';

describe('UserGroups Component - Group Loader', () => {
    test('Can View Groups List Loader', async () => {
        render(<WebApps><BrowserRouter><UsersGroups groups={[]} /></BrowserRouter></WebApps>);
        await waitForElementToBeRemoved(() => screen.getByTestId('user-loader'));

        expect(screen.getByRole('heading', { name: /groups/i })).toBeDefined();

        await act(async () => {
            fireEvent.click(screen.getByRole('heading', { name: /groups/i }));
        });
        await waitFor(() => expect(screen.getByTestId('group-loader')).toBeDefined());
    });
});