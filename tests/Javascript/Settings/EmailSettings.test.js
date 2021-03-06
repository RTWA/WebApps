import React, { useState } from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { WebAppsUX } from 'webapps-react';

import '../../../resources/js/__mocks__/mockMedia';
import * as mockData from '../../../resources/js/__mocks__/mockData';
import EmailSettings from '../../../resources/js/components/Routes/Settings/EmailSettings';

const TestElement = () => {
    const [settings, setSettings] = useState(mockData.settings);

    const typeValue = (key, value) => {
        mockData.settings[key] = value;
        settings[key] = value;
        setSettings({ ...settings });
    }

    const setValue = (key, value, ce) => {
        mockData.settings[key] = value;
        settings[key] = value;
        setSettings({ ...settings });
    }

    return (
        <>
            <EmailSettings settings={mockData.settings} typeValue={typeValue} setValue={setValue} states={{}} />
            <button onClick={() => setValue('azure.graph.tenant', '', false)}>Clear Tenant</button>
        </>
    )
}

describe('EmailSettings Component', () => {
    test('Renders with SMTP', async () => {
        render(<WebAppsUX><TestElement /></WebAppsUX>);

        expect(mockData.settings['mail.driver']).toEqual('smtp');
        await waitFor(() => expect(screen.getByText(/smtp server host/i)).toBeDefined());
        expect(screen.getByText(/smtp server port/i)).toBeDefined();
        expect(screen.getByText(/smtp server encryption/i)).toBeDefined();
        expect(screen.getByText(/smtp from email address/i)).toBeDefined();
        expect(screen.getByText(/smtp from email name/i)).toBeDefined();
        expect(screen.getByText(/smtp password/i)).toBeDefined();
        expect(screen.getByText(/send test to/i)).toBeDefined();
        expect(screen.getByRole('combobox')).toBeDefined();
    });

    test('Can Change A Setting', async () => {
        expect(screen.getByText(/smtp server host/i)).toBeDefined();
        expect(mockData.settings['mail.smtp.host']).toEqual('');

        await act(async () => {
            fireEvent.change(screen.getByRole('textbox', { name: /smtp server host/i }), { target: { value: 'localhost' } });
            await screen.getByRole('textbox', { name: /smtp server host/i }).value === 'localhost';
            fireEvent.blur(screen.getByRole('textbox', { name: /smtp server host/i }), { target: { value: 'localhost' } });
        });
        await waitFor(() => expect(mockData.settings['mail.smtp.host']).toEqual('localhost'));
    });

    test('Cannot Send A Test Email Due To An Error', async () => {
        expect(screen.getByRole('button', { name: /send test email/i })).toBeDefined();

        await act(async () => {
            fireEvent.change(screen.getByRole('textbox', { name: /send test to/i }), { target: { value: 'error@test.com' } });
            await screen.getByRole('textbox', { name: /send test to/i }).value === 'error@test.com';
            fireEvent.blur(screen.getByRole('textbox', { name: /send test to/i }), { target: { value: 'error@test.com' } });
        });

        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: /send test email/i }));
        });
        await waitFor(() => expect(screen.getByText(/unable to send test email/i)).toBeDefined());
    });

    test('Can Send A Test Email', async () => {
        expect(screen.getByRole('button', { name: /send test email/i })).toBeDefined();

        await act(async () => {
            fireEvent.change(screen.getByRole('textbox', { name: /send test to/i }), { target: { value: 'test@test.com' } });
            await screen.getByRole('textbox', { name: /send test to/i }).value === 'test@test.com';
            fireEvent.blur(screen.getByRole('textbox', { name: /send test to/i }), { target: { value: 'test@test.com' } });
        });

        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: /send test email/i }));
        });
        await waitFor(() => expect(screen.getByText(/test email sent/i)).toBeDefined());
    });

    test('Can Change Mail Driver', async () => {
        expect(mockData.settings['mail.driver']).toEqual('smtp');
        expect(screen.getByRole('checkbox', { name: /send with microsoft azure/i })).toBeDefined();

        await act(async () => {
            fireEvent.click(screen.getByRole('checkbox', { name: /send with microsoft azure/i }));
        });
        await waitFor(() => expect(mockData.settings['mail.driver']).toEqual('msgraph'));

        expect(screen.getByText(/please enter a valid organisational email address/i)).toBeDefined();
        expect(screen.getByText(/from email address/i)).toBeDefined();
        expect(screen.getByRole('checkbox', { name: /send with smtp/i })).toBeDefined();

        await act(async () => {
            fireEvent.click(screen.getByRole('checkbox', { name: /send with smtp/i }));
        });
        await waitFor(() => expect(mockData.settings['mail.driver']).toEqual('smtp'));
    });

    test('Cannot Select Azure Mail Driver When Not Configured', async () => {
        expect(mockData.settings['mail.driver']).toEqual('smtp');
        expect(screen.getByRole('checkbox', { name: /send with microsoft azure/i })).toBeDefined();
        expect(screen.getByRole('button', { name: /clear tenant/i })).toBeDefined();

        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: /clear tenant/i }));
        });
        await waitFor(() => expect(mockData.settings['azure.graph.tenant']).toEqual(''));

        expect(screen.queryByRole('checkbox', { name: /send with microsoft azure/i })).toBeNull();
    });
});