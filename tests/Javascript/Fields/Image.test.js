import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { rest } from 'msw';
import { WebApps } from 'webapps-react';

import { server } from '../../../resources/js/__mocks__/server';

import Image from '../../../resources/js/components/Fields/Image';

const mockFunction = jest.fn((e) => {
    return null;
});

describe('Image Field Component', () => {
    test('Can Render Image', () => {
        render(<WebApps><Image name="test" value={{}} update={mockFunction} /></WebApps>);

        expect(screen.getByRole('link', { name: /enter url/i })).toBeDefined();
    });

    test('Can Set By Entering A URL', async () => {
        expect(screen.getByRole('link', { name: /enter url/i })).toBeDefined();

        await act(async () => {
            fireEvent.click(screen.getByRole('link', { name: /enter url/i }));
        });
        await waitFor(() =>
            expect(screen.getByRole('textbox', { name: /get from url:/i })).toBeDefined()
        );

        await act(async () => {
            fireEvent.change(screen.getByRole('textbox', { name: /get from url:/i }), { target: { value: 'http://someimage.com' } });
            await screen.getByRole('textbox', { name: /get from url:/i }).value === 'http://someimage.com';
        });

        expect(mockFunction).toHaveBeenCalled();
    });

    test('Can Set By Uploading An Image', async () => {
        expect(screen.getByLabelText(/upload an image/i)).toBeDefined();

        const file = new File(['(⌐□_□)'], 'image.jpg', { type: 'image/jpeg' });

        await act(async () => {
            fireEvent.change(screen.getByLabelText(/upload an image/i), { target: { files: [file] } });
        });
        await waitFor(() =>
            expect(screen.getByRole('textbox', { name: /uploaded:/i })).toBeDefined()
        );

        expect(mockFunction).toHaveBeenCalled();
    });

    test('Cannot Set By Uploading An Image With An Error', async () => {
        server.use(
            rest.post('/api/media/upload', (req, res, ctx) => {
                return res(
                    ctx.status(500),
                )
            }),
        )

        expect(screen.getByLabelText(/upload an image/i)).toBeDefined();

        const file = new File(['(⌐□_□)'], 'image.jpg', { type: 'image/jpeg' });

        await act(async () => {
            fireEvent.change(screen.getByLabelText(/upload an image/i), { target: { files: [file] } });
        });
        await waitFor(() =>
            expect(screen.getByText(/failed to upload image\./i)).toBeDefined()
        );
    });

    // TODO: This used to pass fine?
    // test('Cannot Set By Uploading An Image With No Image Selected', async () => {
    //     expect(screen.getByLabelText(/upload an image/i)).toBeDefined();

    //     await act(async () => {
    //         fireEvent.change(screen.getByLabelText(/upload an image/i));
    //     });
    //     await waitFor(() =>
    //         expect(screen.getByText(/no image selected!/i)).toBeDefined()
    //     );
    // });
});