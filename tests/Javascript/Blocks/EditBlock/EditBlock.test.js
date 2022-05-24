import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Auth, WebAppsUX } from 'webapps-react';

import { users } from '../../../../resources/js/__mocks__/mockData';
import EditBlock from '../../../../resources/js/components/Routes/Blocks/EditBlock';

describe('EditBlock Component', () => {
    test('Can Render', async () => {
        render(<Auth><WebAppsUX><BrowserRouter><EditBlock id="TestBlock" /></BrowserRouter></WebAppsUX></Auth>);
        await waitFor(() => expect(screen.getByRole('heading', { name: /sample message/i })).toBeDefined());
        await waitFor(() => expect(screen.getByText(/enter the sample message/i)).toBeDefined());
    });

    test('Can Open The Flyout And Change The Properties', async () => {
        expect(screen.getByRole('heading', { name: /sample message/i })).toBeDefined();
        expect(screen.getByRole('button', { name: /block properties/i })).toBeDefined();

        expect(screen.getByRole('textbox', { name: /block title/i })).toHaveValue("Test Block\'s Title");

        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: /block properties/i }));
        });
        await waitFor(() =>
            screen.getByRole('textbox', { name: /block title:/i })
        );
        expect(screen.getByRole('textbox', { name: /block title:/i, hidden: true })).toHaveValue("Test Block\'s Title");

        await act(async () => {
            fireEvent.change(screen.getByRole('textbox', { name: /block title:/i, hidden: true }), { target: { value: 'New Title' } });
            await screen.getByRole('textbox', { name: /block title:/i, hidden: true }).value === 'New Title';
        });
        expect(screen.getByRole('textbox', { name: /block title:/i, hidden: true })).toHaveValue("New Title");

        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: /close panel/i }));
        });
        await waitFor(() =>
            screen.getByRole('textbox', { name: /block title/i }).value === 'New Title'
        );
        expect(screen.getByRole('textbox', { name: /block title/i })).toHaveValue("New Title");

        /* Reset */
        await act(async () => {
            fireEvent.change(screen.getByRole('textbox', { name: /block title/i, hidden: true }), { target: { value: 'Test Block\'s Title' } });
            await screen.getByRole('textbox', { name: /block title/i, hidden: true }).value === 'Test Block\'s Title';
        });
        expect(screen.getByRole('textbox', { name: /block title/i, hidden: true })).toHaveValue("Test Block's Title");
    });

    test('Can Open The Flyout But Cannot Change The Owner To The Current Owner', async () => {
        expect(screen.getByRole('heading', { name: /sample message/i })).toBeDefined();
        expect(screen.getByRole('button', { name: /block properties/i })).toBeDefined();
        expect(screen.getByRole('textbox', { name: /block title/i })).toHaveValue("Test Block\'s Title");

        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: /block properties/i }));
        });
        await waitFor(() => screen.getByRole('button', { name: /change owner/i, hidden: true }));
        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: /change owner/i, hidden: true }));
        });
        await waitFor(() => screen.getByRole('textbox', { name: /enter new owner's username/i, hidden: true }));

        await act(async () => {
            fireEvent.change(screen.getByRole('textbox', { name: /enter new owner's username/i, hidden: true }), { target: { value: users[0].username } });
            await screen.getByRole('textbox', { name: /enter new owner's username/i, hidden: true }).value === users[0].username;
        });
        await waitFor(() => expect(screen.getByText(/\(test@jest\)/i)).toBeDefined());

        await act(async () => {
            fireEvent.click(screen.getByText(/\(test@jest\)/i));
        });
        await waitFor(() => expect(screen.getByRole('textbox', { name: /enter new owner's username/i, hidden: true })).toHaveValue(users[0].username));
        expect(screen.getByRole('button', { name: /change owner/i, hidden: true })).toBeDefined();

        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: /change owner/i, hidden: true }));
        });
        await waitFor(() => screen.getByText(/unable to change owner to the same user!/i));
        expect(screen.getByText(/unable to change owner to the same user!/i)).toBeDefined();
    });

    test('Can Open The Flyout But Cannot Change The Owner Due To An Error', async () => {
        expect(screen.getByRole('heading', { name: /sample message/i })).toBeDefined();
        expect(screen.getByRole('button', { name: /block properties/i })).toBeDefined();
        expect(screen.getByRole('textbox', { name: /block title:/i })).toHaveValue("Test Block\'s Title");

        expect(screen.getByRole('button', { name: /change owner/i, hidden: true }));
        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: /change owner/i, hidden: true }));
        });
        await waitFor(() => screen.getByRole('textbox', { name: /enter new owner's username/i, hidden: true }));
        await act(async () => {
            fireEvent.change(screen.getByRole('textbox', { name: /enter new owner's username/i, hidden: true }), { target: { value: users[4].username } });
            await screen.getByRole('textbox', { name: /enter new owner's username/i, hidden: true }).value === users[4].username;
        });
        await waitFor(() => expect(screen.getByText(/\(admin@test\)/i)).toBeDefined());

        await act(async () => {
            fireEvent.click(screen.getByText(/\(admin@test\)/i));
        });
        await waitFor(() => expect(screen.getByRole('textbox', { name: /enter new owner's username/i, hidden: true })).toHaveValue(users[4].username));
        expect(screen.getByRole('button', { name: /change owner/i, hidden: true })).toBeDefined();

        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: /change owner/i, hidden: true }));
        });
        await waitFor(() => screen.getByText(/an error occurred/i));
        expect(screen.getByText(/an error occurred/i)).toBeDefined();
    });

    test('Can Open The Flyout And Change The Owner', async () => {
        expect(screen.getByRole('heading', { name: /sample message/i })).toBeDefined();
        expect(screen.getByRole('button', { name: /block properties/i })).toBeDefined();
        expect(screen.getByRole('textbox', { name: /block title:/i })).toHaveValue("Test Block\'s Title");

        expect(screen.getByRole('button', { name: /change owner/i, hidden: true }));
        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: /change owner/i, hidden: true }));
        });
        await waitFor(() => screen.getByRole('textbox', { name: /enter new owner's username/i, hidden: true }));
        await act(async () => {
            fireEvent.change(screen.getByRole('textbox', { name: /enter new owner's username/i, hidden: true }), { target: { value: users[1].username } });
            await screen.getByRole('textbox', { name: /enter new owner's username/i, hidden: true }).value === users[1].username;
        });
        await waitFor(() => expect(screen.getByText(/\(jest@test\)/i)).toBeDefined());

        await act(async () => {
            fireEvent.click(screen.getByText(/\(jest@test\)/i));
        });
        await waitFor(() => expect(screen.getByRole('textbox', { name: /enter new owner's username/i, hidden: true })).toHaveValue(users[1].username));
        expect(screen.getByRole('button', { name: /change owner/i, hidden: true })).toBeDefined();

        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: /change owner/i, hidden: true }));
        });
        await waitFor(() => screen.getByText(/owner changed successfully!/i));
        expect(screen.getByText(/owner changed successfully!/i)).toBeDefined();
    });

    test('Can Change Text Value', async () => {
        expect(screen.getByRole('heading', { name: /sample message/i })).toBeDefined();
        expect(screen.getByRole('textbox', { name: /enter the sample message/i })).toBeDefined();

        await act(async () => {
            fireEvent.change(screen.getByRole('textbox', { name: /enter the sample message/i }), { target: { value: 'New Value' } });
            await screen.getByRole('textbox', { name: /enter the sample message/i }).value === 'New Value';
        });
        expect(screen.getByRole('textbox', { name: /enter the sample message/i })).toHaveValue('New Value');

        /* Reset */
        await act(async () => {
            fireEvent.change(screen.getByRole('textbox', { name: /enter the sample message/i }), { target: { value: 'Sample Message' } });
            await screen.getByRole('textbox', { name: /enter the sample message/i }).value === 'Sample Message';
        });
        expect(screen.getByRole('textbox', { name: /enter the sample message/i })).toHaveValue('Sample Message');
    });

    test('Can Open And Close A Repeater Without Any Errors', async () => {
        expect(screen.getByRole('heading', { name: /sample message/i })).toBeDefined();
        expect(screen.getByRole('textbox', { name: /enter the sample message/i })).toBeDefined();

        await act(async () => {
            fireEvent.click(screen.getByText(/image slide:/i));
        });
        await waitFor(() => screen.getByRole('link', { name: /enter url/i }));

        await act(async () => {
            fireEvent.click(screen.getByText(/image slide:/i));
        });
        await waitFor(() => screen.getByRole('link', { name: /enter url/i }));
        expect(screen.getByRole('link', { name: /enter url/i })).toBeDefined();
    });

    test('Can Add And Remove A Repeater', async () => {
        expect(screen.getByRole('heading', { name: /sample message/i })).toBeDefined();
        expect(screen.getByRole('button', { name: /add new image slide/i })).toBeDefined();

        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: /add new image slide/i }));
        });
        await waitFor(() => screen.getAllByText(/image slide:/i).length === 2);
        expect(screen.getAllByText(/image slide:/i)).toHaveLength(2);
        expect(screen.getByTestId('remove-1')).toBeDefined();

        await act(async () => {
            fireEvent.click(screen.getByTestId('remove-1'));
        });
        await waitFor(() => screen.getAllByText(/image slide:/i).length === 1);
        expect(screen.getAllByText(/image slide:/i)).toHaveLength(1);
        expect(screen.queryByTestId('remove-1')).toBeNull();
    });

    test('Can Successfully Save Changes', async () => {
        expect(screen.getByRole('heading', { name: /sample message/i })).toBeDefined();
        expect(screen.getByRole('textbox', { name: /enter the sample message/i })).toBeDefined();

        await act(async () => {
            fireEvent.change(screen.getByRole('textbox', { name: /enter the sample message/i }), { target: { value: 'New Value' } });
            await screen.getByRole('textbox', { name: /enter the sample message/i }).value === 'New Value';
        });
        await waitFor(() => expect(screen.getByRole('textbox', { name: /enter the sample message/i })).toHaveValue('New Value'));
        expect(screen.getByRole('button', { name: /save changes/i })).toBeDefined();

        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: /save changes/i }));
        });
        await waitFor(() => screen.getByRole('button', { name: /saving\.\.\./i }));
        await waitFor(() => expect(screen.getByText(/saved!/i)).toBeDefined());
    });

    test('Cannot Successfully Save Changes', async () => {
        expect(screen.getByRole('heading', { name: /new value/i })).toBeDefined();
        expect(screen.getByRole('textbox', { name: /enter the sample message/i })).toBeDefined();

        await act(async () => {
            fireEvent.change(screen.getByRole('textbox', { name: /enter the sample message/i }), { target: { value: 'Error This' } });
            await screen.getByRole('textbox', { name: /enter the sample message/i }).value === 'Error This';
        });
        await waitFor(() => expect(screen.getByRole('textbox', { name: /enter the sample message/i })).toHaveValue('Error This'));
        expect(screen.getByRole('button', { name: /save changes/i })).toBeDefined();

        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: /save changes/i }));
        });
        await waitFor(() => screen.getByRole('button', { name: /saving\.\.\./i }));
        await waitFor(() => screen.getByText(/an error occurred whilst saving the block\./i));
        expect(screen.getByText(/an error occurred whilst saving the block\./i)).toBeDefined();
    });
});