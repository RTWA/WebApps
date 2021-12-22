import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

import '../../../resources/js/__mocks__/mockMedia';
import * as mockData from '../../../resources/js/__mocks__/mockData';

import { WebApps } from 'webapps-react';

import EmailSettings from '../../../resources/js/components/Routes/Settings/EmailSettings';

const mockFunction = (e) => {
    return null;
}

test('Renders SMTP Email Settings', () => {
    render(<WebApps><EmailSettings settings={mockData.settings} typeValue={mockFunction} setValue={mockFunction} states={{}} /></WebApps>);

    expect(screen.getByText(/smtp server host/i)).toBeDefined();
    expect(screen.getByText(/smtp server port/i)).toBeDefined();
    expect(screen.getByText(/smtp server encryption/i)).toBeDefined();
    expect(screen.getByText(/smtp from email address/i)).toBeDefined();
    expect(screen.getByText(/smtp from email name/i)).toBeDefined();
    expect(screen.getByText(/smtp password/i)).toBeDefined();
    expect(screen.getByText(/send test to/i)).toBeDefined();
    expect(screen.getByRole('combobox')).toBeDefined();
});

test('Can Change A Setting', async () => {
    render(<WebApps><EmailSettings settings={mockData.settings} typeValue={mockFunction} setValue={mockFunction} states={{}} /></WebApps>);

    expect(screen.getByText(/smtp server host/i)).toBeDefined();

    await act(async () => {
        fireEvent.change(screen.getByRole('textbox', { name: /smtp server host/i }), { target: { value: 'localhost' } });
        await screen.getByRole('textbox', { name: /smtp server host/i }).value === 'localhost';
    });

    await act(async () => {
        fireEvent.blur(screen.getByRole('textbox', { name: /smtp server host/i }));
    });

    expect(screen.getByText(/smtp server host/i)).toBeDefined();
});

test('Can Send A Test Email', async () => {
    render(<WebApps><EmailSettings settings={mockData.settings} typeValue={mockFunction} setValue={mockFunction} states={{}} /></WebApps>);

    expect(screen.getByText(/send test to/i)).toBeDefined();

    await act(async () => {
        fireEvent.change(screen.getByRole('textbox', { name: /send test to/i }), { target: { value: 'test@test.com' } });
        await screen.getByRole('textbox', { name: /send test to/i }).value === 'test@test.com';
    });

    await act(async () => {
        fireEvent.blur(screen.getByRole('textbox', { name: /send test to/i }));
    });

    await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /send test email/i }));
    });
    await waitFor(() =>
        screen.getByText(/test email sent/i)
    );

    expect(screen.getByText(/test email sent/i)).toBeDefined();
});

test('Cannot Send A Test Email Due To An Error', async () => {
    render(<WebApps><EmailSettings settings={mockData.settings} typeValue={mockFunction} setValue={mockFunction} states={{}} /></WebApps>);

    expect(screen.getByText(/send test to/i)).toBeDefined();

    await act(async () => {
        fireEvent.change(screen.getByRole('textbox', { name: /send test to/i }), { target: { value: 'error@test.com' } });
        await screen.getByRole('textbox', { name: /send test to/i }).value === 'error@test.com';
    });

    await act(async () => {
        fireEvent.blur(screen.getByRole('textbox', { name: /send test to/i }));
    });

    await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /send test email/i }));
    });
    await waitFor(() =>
        screen.getByText(/unable to send test email/i)
    );

    expect(screen.getByText(/unable to send test email/i)).toBeDefined();
});

test('Can Change To Mail Driver', async () => {
    mockData.settings['azure.graph.tenant'] = '123';
    render(<WebApps><EmailSettings settings={mockData.settings} typeValue={mockFunction} setValue={mockFunction} states={{}} /></WebApps>);

    expect(screen.getByText(/smtp server host/i)).toBeDefined();
    expect(screen.getByRole('checkbox', { name: /send with microsoft azure/i })).toBeDefined();

    await act(async () => {
        fireEvent.click(screen.getByRole('checkbox', { name: /send with microsoft azure/i }));
        mockData.settings['mail.driver'] = 'msgraph';
    });
    await waitFor(() =>
        screen.getByText(/please enter a valid organisational email address/i)
    );

    expect(screen.getByText(/from email address/i)).toBeDefined();
    expect(screen.getByRole('checkbox', {  name: /send with smtp/i})).toBeDefined();

    await act(async () => {
        fireEvent.click(screen.getByRole('checkbox', { name: /send with smtp/i }));
        mockData.settings['mail.driver'] = 'smtp';
    });
    await waitFor(() =>
        screen.getByText(/smtp from email address/i)
    );
    
    expect(screen.getByText(/smtp from email address/i)).toBeDefined();
});