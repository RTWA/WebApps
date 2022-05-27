import React, { useState } from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { WebAppsUX } from 'webapps-react';

import '../../../resources/js/__mocks__/mockMedia';
import * as mockData from '../../../resources/js/__mocks__/mockData';
import ApplicationSettings from '../../../resources/js/components/Routes/Settings/ApplicationSettings';

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

    return <ApplicationSettings loginMethods={mockData.loginMethods} settings={settings} typeValue={typeValue} setValue={setValue} states={{}} />
}

describe('ApplicationSettings Component', () => {
    test('Renders', async () => {
        render(<WebAppsUX><TestElement /></WebAppsUX>);

        await waitFor(() => expect(screen.getByText(/theme colour/i)).toBeDefined());
        expect(screen.getByText(/dark mode only/i)).toBeDefined();
        expect(screen.getByText(/display "return to cms" link/i)).toBeDefined();
        expect(screen.getByText(/cms url/i)).toBeDefined();
        expect(screen.getByText(/"return to cms" link text/i)).toBeDefined();
    });

    test('Can Enable Error Reporting', async () => {
        expect(screen.getByRole('checkbox', { name: /enable error reporting/i })).toBeDefined();
        expect(screen.getByRole('checkbox', { name: /enable error reporting/i }).checked).toEqual(false);

        await act(async () => {
            fireEvent.click(screen.getByRole('checkbox', { name: /enable error reporting/i }));
        });
        await waitFor(() => expect(screen.getByRole('checkbox', { name: /enable error reporting/i }).checked).toEqual(true));
    });

    test('Can Disable Error Reporting', async () => {
        expect(screen.getByRole('checkbox', { name: /enable error reporting/i })).toBeDefined();
        expect(screen.getByRole('checkbox', { name: /enable error reporting/i }).checked).toEqual(true);

        await act(async () => {
            fireEvent.click(screen.getByRole('checkbox', { name: /enable error reporting/i }));
        });
        await waitFor(() => expect(screen.getByRole('checkbox', { name: /enable error reporting/i }).checked).toEqual(false));
    });

    test('Can Select The Same Colour Theme', async () => {
        expect(screen.getByText(/theme colour/i)).toBeDefined();
        expect(mockData.settings['core.ui.theme']).toEqual('indigo');

        await act(async () => {
            fireEvent.click(screen.getByText(/indigo/i));
        });
        await waitFor(() => expect(mockData.settings['core.ui.theme']).toEqual('indigo'));
    });

    test('Can Select A Different Colour Theme', async () => {
        expect(screen.getByText(/theme colour/i)).toBeDefined();
        expect(mockData.settings['core.ui.theme']).toEqual('indigo');

        await act(async () => {
            fireEvent.click(screen.getByText(/red/i));
        });
        await waitFor(() => expect(mockData.settings['core.ui.theme']).toEqual('red'));
    });

    test('Can Select The Custom Colour Theme', async () => {
        expect(screen.getByText(/theme colour/i)).toBeDefined();
        expect(mockData.settings['core.ui.theme']).toEqual('red');

        await act(async () => {
            fireEvent.click(screen.getByText(/custom/i));
        });
        await waitFor(() =>
            screen.getByRole('textbox', { name: /custom colour/i })
        );
        expect(mockData.settings['core.ui.theme']).toEqual('brand');
        await act(async () => {
            fireEvent.change(screen.getByRole('textbox', { name: /custom colour/i }), { target: { value: '11' } });
            fireEvent.change(screen.getByRole('textbox', { name: /custom colour/i }), { target: { value: '112233' } });
            await screen.getByRole('textbox', { name: /custom colour/i }).value === '#112233';
        });
        await act(async () => {
            fireEvent.change(screen.getByRole('textbox', { name: /custom colour/i }), { target: { value: '#55AA22' } });
            await screen.getByRole('textbox', { name: /custom colour/i }).value === '#55AA22';
            fireEvent.blur(screen.getByRole('textbox', { name: /custom colour/i }));
        });
        await waitFor(() => expect(screen.getByText(/branding updated!/i)).toBeDefined());
    });

    test('Can Select Light Mode', async () => {
        expect(screen.getByText(/dark mode option/i)).toBeDefined();
        expect(mockData.settings['core.ui.dark_mode']).toEqual('user');

        await act(async () => {
            fireEvent.click(screen.getByText(/light mode only/i));
        });
        await waitFor(() => expect(mockData.settings['core.ui.dark_mode']).toEqual('light'));
    });

    test('Can Select Dark Mode', async () => {
        expect(screen.getByText(/dark mode option/i)).toBeDefined();
        expect(mockData.settings['core.ui.dark_mode']).toEqual('light');

        await act(async () => {
            fireEvent.click(screen.getByText(/dark mode only/i));
        });
        await waitFor(() => expect(mockData.settings['core.ui.dark_mode']).toEqual('dark'));
    });

    test('Can Select User Selectable Mode', async () => {
        expect(screen.getByText(/dark mode option/i)).toBeDefined();
        expect(mockData.settings['core.ui.dark_mode']).toEqual('dark');

        await act(async () => {
            fireEvent.click(screen.getAllByText(/user selectable/i)[0]);
        });
        await waitFor(() => expect(mockData.settings['core.ui.dark_mode']).toEqual('user'));
    });

    test('Can Disable CMS Link', async () => {
        expect(screen.getByText(/display "return to cms" link/i)).toBeDefined();
        expect(mockData.settings['core.cms.display_link']).toEqual('true');

        await act(async () => {
            fireEvent.click(screen.getByRole('checkbox', { name: /display "return to cms" link/i }));
        });
        await waitFor(() => expect(mockData.settings['core.cms.display_link']).toEqual('false'));
    });

    test('Can Enable CMS Link', async () => {
        expect(screen.getByText(/display "return to cms" link/i)).toBeDefined();
        expect(mockData.settings['core.cms.display_link']).toEqual('false');

        await act(async () => {
            fireEvent.click(screen.getByRole('checkbox', { name: /display "return to cms" link/i }));
        });
        await waitFor(() => expect(mockData.settings['core.cms.display_link']).toEqual('true'));
    });

    test('Can Type A CMS URL', async () => {
        expect(screen.getByText(/cms url/i)).toBeDefined();
        expect(mockData.settings['core.cms.url']).toEqual('');

        await act(async () => {
            fireEvent.change(screen.getByRole('textbox', { name: /cms url/i }), { target: { value: 'URL' } });
            await screen.getByRole('textbox', { name: /cms url/i }).value === 'URL';
            fireEvent.blur(screen.getByRole('textbox', { name: /cms url/i }), { target: { value: 'URL' } });
        });
        await waitFor(() => expect(mockData.settings['core.cms.url']).toEqual('URL'));
    });

    test('Can Type CMS Link Text', async () => {
        expect(screen.getByText(/"return to cms" link text/i)).toBeDefined();
        expect(mockData.settings['core.cms.text']).toEqual('');

        await act(async () => {
            fireEvent.change(screen.getByRole('textbox', { name: /"return to cms" link text/i }), { target: { value: 'Text' } });
            await screen.getByRole('textbox', { name: /"return to cms" link text/i }).value === 'Text';
            fireEvent.blur(screen.getByRole('textbox', { name: /"return to cms" link text/i }), { target: { value: 'Text' } });
        });
        await waitFor(() => expect(mockData.settings['core.cms.text']).toEqual('Text'));
    });
});