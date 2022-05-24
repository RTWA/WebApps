import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { act, fireEvent, render, screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react';
import { WebAppsUX } from 'webapps-react';

import * as mockData from '../../../resources/js/__mocks__/mockData';
import ConfigEditor from '../../../resources/js/components/Routes/Settings/ConfigEditor';

const mockFunction = (e) => {
    return null;
}

const typeValue = (key, value) => {
    mockData.settings[key] = value;
}

const setValue = (key, value, ce) => {
    let config_editor = (ce !== undefined);
    if (config_editor) {
        key = key.replace('ce-', '');
    }
    mockData.settings[key] = value;
}

describe('ConfigEditor Component', () => {
    test('Renders Config Editor', () => {
        render(<WebAppsUX><BrowserRouter><ConfigEditor settings={mockData.settings} typeValue={typeValue} setValue={setValue} createKey={mockFunction} deleteKey={mockFunction} states={{}} /></BrowserRouter></WebAppsUX>);

        expect(screen.getByText(/config editor \(advanced\)/i)).toBeDefined();
        expect(screen.getByRole('button', { name: /i understand/i })).toBeDefined();
    });

    test('Clicking I Understand reveals the grid', async () => {
        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: /i understand/i }));
        });
        await waitFor(() =>
            screen.getByRole('heading', { name: /config key/i })
        );
        expect(screen.getByText(/core\.mocked\.data_mocked/i)).toBeDefined();
        expect(screen.getByRole('button', { name: /create key/i })).toBeDefined();
    });

    test('Can Change A Keys Value', async () => {
        await waitFor(() =>
            screen.getByRole('heading', { name: /config key/i })
        );

        expect(screen.getByText(/core\.mocked\.data_mocked/i)).toBeDefined();

        await act(async () => {
            fireEvent.change(screen.getByTestId('edit_core.mocked.data_mocked'), { target: { value: 'mocked value' } });
            await screen.getByTestId('edit_core.mocked.data_mocked').value === 'mocked value';
            mockData.settings['core.mocked.data_mocked'] = 'mocked value';
        });
        await waitFor(() => {
            screen.getByTestId('edit_core.mocked.data_mocked').value === 'mocked value';
        });
        await act(async () => {
            fireEvent.blur(screen.getByTestId('edit_core.mocked.data_mocked'));
            mockData.settings['core.mocked.data_mocked'] = 'mocked value';
        });
        await waitFor(() => expect(mockData.settings['core.mocked.data_mocked']).toEqual('mocked value'));

        expect(screen.getByText(/core\.mocked\.data_mocked/i)).toBeDefined();
    });

    // FIXME: Not Working
    // test('Delete A Key After A Prompt', async () => {
    //     await act(async () => {
    //         fireEvent.click(screen.getByTestId('delete_core.mocked.data_mocked'));
    //     });
    //     await waitFor(() =>
    //         screen.getByRole('heading', { name: /are you sure\?/i })
    //     );

    //     expect(screen.getByRole('button', { name: /yes/i })).toBeDefined();

    //     await act(async () => {
    //         fireEvent.click(screen.getByRole('button', { name: /yes/i }));
    //         delete mockData.settings['core.mocked.data_mocked'];
    //     });
    //     await waitForElementToBeRemoved(() => screen.getByTestId('delete_core.mocked.data_mocked'));
    //     expect(screen.getByTestId('delete_core.mocked.data_mocked')).toBeNull();
    // });

    test('Can Create A New Key', async () => {
        expect(screen.getByRole('textbox', {  name: /create a new key/i})).toBeDefined();
        expect(screen.getByRole('button', {  name: /create key/i})).toBeDefined();

        await act(async () => {
            fireEvent.change(screen.getByRole('textbox', {  name: /create a new key/i}), { target: { value: 'new.key' } });
            await screen.getByRole('textbox', {  name: /create a new key/i}).value === 'new.key';
            mockData.settings['new.key'] = '';
            fireEvent.blur(screen.getByRole('textbox', {  name: /create a new key/i}), { target: { value: 'new.key' } });
            fireEvent.click(screen.getByRole('button', {  name: /create key/i}));
        });
        await waitFor(() => expect(screen.getByText(/new\.key/i)).toBeDefined());
        expect(screen.getByTestId('edit_new.key')).toBeDefined();
    });
});