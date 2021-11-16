import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

import '../../../resources/js/__mocks__/mockMedia';
import * as mockData from '../../../resources/js/__mocks__/mockData';

import { WebApps } from 'webapps-react';

import ApplicationSettings from '../../../resources/js/components/Routes/Settings/ApplicationSettings';

const mockFunction = (e) => {
    return null;
}

test('Renders Application Settings Page', () => {
    render(<WebApps><ApplicationSettings loginMethods={mockData.loginMethods} settings={mockData.settings} typeValue={mockFunction} setValue={mockFunction} states={{}} /></WebApps>);

    expect(screen.getByText(/theme colour/i)).toBeDefined();
    expect(screen.getByText(/dark mode only/i)).toBeDefined();
    expect(screen.getByText(/display "return to cms" link/i)).toBeDefined();
    expect(screen.getByText(/cms url/i)).toBeDefined();
    expect(screen.getByText(/"return to cms" link text/i)).toBeDefined();
});

test('Can Enable Error Reporting', async () => {
    mockData.settings['core.error.reporting'] = 'false';
    render(<WebApps><ApplicationSettings loginMethods={mockData.loginMethods} settings={mockData.settings} typeValue={mockFunction} setValue={mockFunction} states={{}} /></WebApps>);

    expect(screen.getByRole('checkbox', { name: /enable error reporting/i })).toBeDefined();

    await act(async () => {
        fireEvent.click(screen.getByRole('checkbox', { name: /enable error reporting/i }));
    });
    await waitFor(() =>
        screen.getByRole('checkbox', { name: /enable error reporting/i })
    );

    expect(screen.getByRole('checkbox', { name: /enable error reporting/i })).toBeDefined();
});

test('Can Disable Error Reporting', async () => {
    mockData.settings['core.error.reporting'] = 'true';
    render(<WebApps><ApplicationSettings loginMethods={mockData.loginMethods} settings={mockData.settings} typeValue={mockFunction} setValue={mockFunction} states={{}} /></WebApps>);

    expect(screen.getByRole('checkbox', { name: /enable error reporting/i })).toBeDefined();

    await act(async () => {
        fireEvent.click(screen.getByRole('checkbox', { name: /enable error reporting/i }));
    });
    await waitFor(() =>
        screen.getByRole('checkbox', { name: /enable error reporting/i })
    );

    expect(screen.getByRole('checkbox', { name: /enable error reporting/i })).toBeDefined();
});

test('Can Select The Same Colour Theme', async () => {
    render(<WebApps><ApplicationSettings loginMethods={mockData.loginMethods} settings={mockData.settings} typeValue={mockFunction} setValue={mockFunction} states={{}} /></WebApps>);

    expect(screen.getByText(/theme colour/i)).toBeDefined();

    await act(async () => {
        fireEvent.click(screen.getByText(/indigo/i));
    });
    await waitFor(() =>
        screen.getByText(/indigo/i)
    );

    expect(screen.getByText(/indigo/i)).toBeDefined();
});

test('Can Select A Different Colour Theme', async () => {
    render(<WebApps><ApplicationSettings loginMethods={mockData.loginMethods} settings={mockData.settings} typeValue={mockFunction} setValue={mockFunction} states={{}} /></WebApps>);

    expect(screen.getByText(/theme colour/i)).toBeDefined();

    await act(async () => {
        fireEvent.click(screen.getByText(/red/i));
    });
    await waitFor(() =>
        screen.getByText(/red/i)
    );

    expect(screen.getByText(/red/i)).toBeDefined();
});

test('Can Select Light Mode', async () => {
    render(<WebApps><ApplicationSettings loginMethods={mockData.loginMethods} settings={mockData.settings} typeValue={mockFunction} setValue={mockFunction} states={{}} /></WebApps>);

    expect(screen.getByText(/dark mode option/i)).toBeDefined();

    await act(async () => {
        fireEvent.click(screen.getByText(/light mode only/i));
    });
    await waitFor(() =>
        screen.getByText(/light mode only/i)
    );

    expect(screen.getByText(/light mode only/i)).toBeDefined();
});

test('Can Select Dark Mode', async () => {
    render(<WebApps><ApplicationSettings loginMethods={mockData.loginMethods} settings={mockData.settings} typeValue={mockFunction} setValue={mockFunction} states={{}} /></WebApps>);

    expect(screen.getByText(/dark mode option/i)).toBeDefined();

    await act(async () => {
        fireEvent.click(screen.getByText(/dark mode only/i));
    });
    await waitFor(() =>
        screen.getByText(/dark mode only/i)
    );

    expect(screen.getByText(/dark mode only/i)).toBeDefined();
});

test('Can Select User Selectable Mode', async () => {
    render(<WebApps><ApplicationSettings loginMethods={mockData.loginMethods} settings={mockData.settings} typeValue={mockFunction} setValue={mockFunction} states={{}} /></WebApps>);

    expect(screen.getByText(/dark mode option/i)).toBeDefined();

    await act(async () => {
        fireEvent.click(screen.getByText(/user selectable/i));
    });
    await waitFor(() =>
        screen.getByText(/user selectable/i)
    );

    expect(screen.getByText(/user selectable/i)).toBeDefined();
});

test('Can Enable CMS Link', async () => {
    mockData.settings['core.cms.display_link'] = 'false';
    render(<WebApps><ApplicationSettings loginMethods={mockData.loginMethods} settings={mockData.settings} typeValue={mockFunction} setValue={mockFunction} states={{}} /></WebApps>);

    expect(screen.getByText(/display "return to cms" link/i)).toBeDefined();

    await act(async () => {
        fireEvent.click(screen.getByRole('checkbox', {  name: /display "return to cms" link/i}));
    });
    await waitFor(() =>
        screen.getByRole('checkbox', {  name: /display "return to cms" link/i})
    );

    expect(screen.getByRole('checkbox', {  name: /display "return to cms" link/i})).toBeDefined();
});

test('Can Disable CMS Link', async () => {
    mockData.settings['core.cms.display_link'] = 'true';
    render(<WebApps><ApplicationSettings loginMethods={mockData.loginMethods} settings={mockData.settings} typeValue={mockFunction} setValue={mockFunction} states={{}} /></WebApps>);

    expect(screen.getByText(/display "return to cms" link/i)).toBeDefined();

    await act(async () => {
        fireEvent.click(screen.getByRole('checkbox', {  name: /display "return to cms" link/i}));
    });
    await waitFor(() =>
        screen.getByRole('checkbox', {  name: /display "return to cms" link/i})
    );

    expect(screen.getByRole('checkbox', {  name: /display "return to cms" link/i})).toBeDefined();
});

test('Can Type A CMS URL', async () => {
    render(<WebApps><ApplicationSettings loginMethods={mockData.loginMethods} settings={mockData.settings} typeValue={mockFunction} setValue={mockFunction} states={{}} /></WebApps>);

    expect(screen.getByText(/cms url/i)).toBeDefined();
    
    await act(async () => {
        fireEvent.change(screen.getByRole('textbox', {  name: /cms url/i}), { target: { value: 'URL' } });
        await screen.getByRole('textbox', {  name: /cms url/i}).value === 'URL';
    });

    expect(screen.getByText(/cms url/i)).toBeDefined();
});

test('Can Type CMS Link Text', async () => {
    render(<WebApps><ApplicationSettings loginMethods={mockData.loginMethods} settings={mockData.settings} typeValue={mockFunction} setValue={mockFunction} states={{}} /></WebApps>);

    expect(screen.getByText(/"return to cms" link text/i)).toBeDefined();
    
    await act(async () => {
        fireEvent.change(screen.getByRole('textbox', {  name: /"return to cms" link text/i}), { target: { value: 'Text' } });
        await screen.getByRole('textbox', {  name: /"return to cms" link text/i}).value === 'Text';
    });

    expect(screen.getByText(/"return to cms" link text/i)).toBeDefined();
});