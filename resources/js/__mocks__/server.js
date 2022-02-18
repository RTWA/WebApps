import { rest } from 'msw';
import { setupServer } from 'msw/node';

import * as mockData from './mockData';

const handlers = [
    rest.post('/login', (req, res, ctx) => {
        const { username, password } = req.body;

        // Testing for valid credentials
        if (username === mockData.User.username && password == mockData.User.password) {
            return res(
                ctx.status(204),
            );
        } else if (username === mockData.users[1].username && password == mockData.users[1].password) {
            return res(
                ctx.status(422),
                ctx.json({
                    message: "The given data was invalid.",
                    errors: {
                        username: ["Your account has been disabled. Please contact your System Administrator."]
                    }
                })
            );
        } else {
            return res(
                ctx.status(422),
                ctx.json({
                    message: "The given data was invalid.",
                    errors: {
                        username: ["These credentials do not match our records."]
                    }
                })
            );
        }
    }),

    rest.get('/api/user', (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json(mockData.User)
        )
    }),

    rest.post('/api/user', (req, res, ctx) => {
        if (req.body.username === mockData.User.username) {
            return res(
                ctx.status(422),
                ctx.json({
                    message: "The given data was invalid.",
                    errors: {
                        username: ["The username has already been taken."]
                    }
                })
            )
        } else if (req.body.name === 'unknown') {
            return res(
                ctx.status(500)
            )
        } else {
            return res(
                ctx.status(200),
                ctx.json({
                    success: true,
                    message: "User created successfully",
                    user: {
                        name: req.body.name,
                        username: req.body.username,
                        email: req.body.email,
                        active: true
                    }
                })
            )
        }
    }),

    rest.get('/api/users', (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json({
                users: [mockData.users[0], mockData.users[1], mockData.users[4]]
            })
        )
    }),

    rest.get('/api/users/disabled', (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json({
                users: [mockData.users[2], mockData.users[3]]
            })
        )
    }),

    rest.post('/api/user/group', (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json({
                message: "Group Updated",
                success: true
            })
        )
    }),

    rest.delete('/api/user/:id', (req, res, ctx) => {
        var { users } = mockData;
        var user = {};
        users.map(function (u) {
            if (u.id == req.params.id) {
                user = u;
            }
        });
        user.active = false;

        return res(
            ctx.status(200),
            ctx.json({
                user: user,
                success: true
            })
        )
    }),

    rest.get('/api/user/:id/enable', (req, res, ctx) => {
        var { users } = mockData;
        var user = {};
        users.map(function (u) {
            if (u.id == req.params.id) {
                user = u;
            }
        });
        user.active = true;

        return res(
            ctx.status(200),
            ctx.json({
                user: user,
                success: true
            })
        )
    }),

    rest.delete('/api/user/:id/hard', (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json({
                success: true
            })
        )
    }),

    rest.post('/api/group', (req, res, ctx) => {
        if (req.body.name === mockData.groups[0].name) {
            return res(
                ctx.status(422),
                ctx.json({
                    message: "The given data was invalid.",
                    errors: {
                        name: ["The name has already been taken."]
                    }
                })
            )
        }
        return res(
            ctx.json({
                success: true,
                message: "Group created successfully",
                group: {
                    name: req.body.name,
                    id: 10,
                    guard_name: "web",
                    permissions: [
                        mockData.groups[0].permissions[0]
                    ]
                }
            })
        )
    }),

    rest.patch('/api/group', (req, res, ctx) => {
        if (req.body.new_name === 'invalid') {
            return res(
                ctx.status(422),
                ctx.json({
                    message: "The given data was invalid.",
                    errors: {
                        new_name: ["This is invalid."]
                    }
                })
            )
        } else if (req.body.new_name === 'old_name_error') {
            return res(
                ctx.status(422),
                ctx.json({
                    message: "The given data was invalid.",
                    errors: {
                        old_name: ["The old name must exist."]
                    }
                })
            )
        } else {
            var group = { ...mockData.groups[0] };
            group.name = req.body.new_name;

            return res(
                ctx.status(200),
                ctx.json({
                    success: true,
                    message: "Group renamed successfully",
                    group: group
                })
            )
        }
    }),

    rest.delete('/api/group', (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json({
                success: true
            })
        )
    }),

    rest.post('/api/permissions', (req, res, ctx) => {
        if (req.body.perm == '10000') {
            return res(
                ctx.status(500),
            )
        } else {
            return res(
                ctx.status(200),
                ctx.json({
                    success: true
                })
            )
        }
    }),

    rest.get('/api/apps', (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json({
                apps: mockData.apps
            })
        )
    }),

    rest.get('/api/online/apps/list', (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json({
                apps: mockData.apps
            })
        )
    }),

    rest.get('/api/plugins', (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json({
                plugins: mockData.plugins
            })
        )
    }),

    rest.get('/api/plugins/active', (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json({
                plugins: mockData.plugins
            })
        )
    }),

    rest.get('/api/blocks', (req, res, ctx) => {
        let offset = req.url.searchParams.get('offset');
        let filter = req.url.searchParams.get('filter');
        if (offset === '0' && filter !== 'none') {
            return res(
                ctx.status(200),
                ctx.json({
                    blocks: [mockData.blocks[0]],
                    styles: {
                        Sample: ".Sample { display:block; }"
                    },
                    total: 32
                })
            )
        } else if (filter === 'none') {
            return res(
                ctx.status(200),
                ctx.json({
                    blocks: [],
                    styles: [],
                    total: 0
                })
            )
        } else {
            return res(
                ctx.status(200),
                ctx.json({
                    blocks: [mockData.blocks[1]],
                    styles: {
                        Sample2: ".Sample2 { display:block; }"
                    },
                    total: 2
                })
            )
        }
    }),

    rest.get('/api/blocks/user/:username', (req, res, ctx) => {
        if (req.params.username == 'jest2') {
            let offset = req.url.searchParams.get('offset');
            if (offset === '0') {
                return res(
                    ctx.status(200),
                    ctx.json({
                        blocks: [mockData.blocks[0]],
                        styles: {
                            Sample: ".Sample { display:block; }"
                        },
                        total: 32
                    })
                )
            } else {
                return res(
                    ctx.status(200),
                    ctx.json({
                        blocks: [mockData.blocks[1]],
                        styles: {
                            Sample2: ".Sample2 { display:block; }"
                        },
                        total: 2
                    })
                )
            }
        } else {
            return res(
                ctx.status(200),
                ctx.json({
                    blocks: [],
                    styles: {},
                    total: 0
                })
            )
        }
    }),

    rest.get('/api/blocks/:id', (req, res, ctx) => {
        if (req.params.id == mockData.blocks[0].id) {
            return res(
                ctx.status(200),
                ctx.json({
                    styles: {
                        Sample: '.Sample { display: block; }',
                    },
                    block: mockData.blocks[0]
                })
            )
        } else {
            return res(
                ctx.status(200),
                ctx.json({
                    styles: {
                        Sample: '.a-random-class { display:block; }'
                    },
                    block: {
                        "settings": {
                            "message": "Sample Message",
                            "slides": [
                                {
                                    "imageUrl": {
                                        "src": "",
                                        "text": "",
                                        "class": "hidden",
                                        "readonly": false,
                                        "label": "Get from URL:"
                                    },
                                    "caption": ""
                                }
                            ]
                        },
                        "plugin": mockData.plugins[0],
                        "user": mockData.User,
                        "owner": mockData.User.id,
                        "publicId": "TestBlock",
                        "scripts": "let x = 'y'",
                        "output": "<div class=\"Sample\" id=\"slider\"><h1>Sample Message</h1><div class=\"slider-item \" id=\"slide1\"><img class=\"w-full\"src=\"\"alt=\"\"/><div class=\"absolute bottom-5 left-0 right-0 text-center\"><p class=\"inline-block font-semibold text-sm text-white p-2 bg-gray-800 bg-opacity-60 rounded\"></p></div></div><button class=\"prev\"><svg xmlns=\"http://www.w3.org/2000/svg\" class=\"h-6 w-6\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M15 19l-7-7 7-7\" /></svg></button><button class=\"next\"><svg xmlns=\"http://www.w3.org/2000/svg\" class=\"h-6 w-6\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M9 5l7 7-7 7\" /></svg></button><span class=\"switch\"></span><div /></div>",
                        "options": {
                            "message": {
                                "label": "Enter the sample message",
                                "maxlength": 255,
                                "required": true,
                                "type": "text"
                            },
                            "slides": {
                                "type": "repeater",
                                "label": "Image Slide",
                                "ref": "caption",
                                "options": {
                                    "imageUrl": {
                                        "type": "image",
                                        "required": true
                                    },
                                    "caption": {
                                        "type": "text",
                                        "label": "Image Caption",
                                        "maxLength": 255,
                                        "required": false
                                    },
                                    "none": {
                                        "type": "none",
                                    },
                                }
                            },
                            "none": {
                                "type": "none",
                            },
                            "custom": {
                                "type": "custom",
                            }
                        },
                        "preview": {
                            "message": "<h1 data-val=\"value\" />",
                            "slides": {
                                "each": "<div class=\"slider-item\" id=\"slide{index-1}\"><img class=\"w-full\" src=\"{value.imageUrl.src}\" alt=\"{value.caption}\" /><div class=\"absolute bottom-5 left-0 right-0 text-center\"><p class=\"inline-block font-semibold text-sm text-white p-2 bg-gray-800 bg-opacity-60 rounded\" data-val=\"value.caption\"></p></div></div>"
                            },
                            "custom": "<div />",
                            "repeater": "var slides = document.getElementsByClassName('slider-item');var i;for (i = 0; i < slides.length; i++) { slides[i].classList.remove('show'); } var slide = document.getElementById('slide'+repeater); if (slide) { slide.classList.add('show'); }"
                        },
                        "new": {
                            "message": "",
                            "slides": [
                                {
                                    "imageUrl": {
                                        "src": "",
                                        "text": "",
                                        "class": "hidden",
                                        "readonly": false,
                                        "label": "Get from URL:"
                                    },
                                    "caption": "",
                                    "none": "",
                                }
                            ],
                            "none": "",
                            "custom": "",
                        },
                        "number_of_blocks": 0,
                        "title": "Test Block\'s Title",
                        "notes": "",
                    },
                })
            )
        }
    }),

    rest.post('/api/blocks/:id/chown', (req, res, ctx) => {
        if (req.body.new_owner_id === mockData.users[4].id) {
            return res(
                ctx.status(500),
                ctx.json({
                    message: "An error occurred"
                })
            )
        }
        return res(
            ctx.status(200),
            ctx.json({
                block: mockData.blocks[0]
            })
        )
    }),

    rest.put('/api/blocks/:id', (req, res, ctx) => {
        let block = JSON.parse(req.body.block);
        if (block.settings.message === "Error This" || block.title === "Error This") {
            return res(
                ctx.status(500)
            )
        }

        return res(
            ctx.status(201),
            ctx.json({
                message: "Saved!"
            })
        )
    }),

    rest.delete('/api/blocks/:id', (req, res, ctx) => {
        if (req.params.id === 'test-block-2') {
            return res(
                ctx.status(500)
            )
        }

        return res(
            ctx.status(200),
            ctx.json({
                message: 'Deleted!'
            })
        )
    }),

    rest.get('/api/online/plugins/list', (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json({
                plugins: mockData.plugins
            })
        )
    }),

    rest.get('/api/navigation', (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json(mockData.navigation)
        )
    }),

    rest.post('/api/setting', (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json({
                settings: [],
            })
        )
    }),

    rest.post('/api/email/test', (req, res, ctx) => {
        if (req.body.to === 'test@test.com') {
            return res(
                ctx.status(200),
                ctx.json({
                    settings: [],
                }),
            )
        } else if (req.body.to === 'error@test.com') {
            return res(
                ctx.status(500),
            )
        }
    }),

    rest.post('/api/admin/user.password/reset', (req, res, ctx) => {
        if (req.body.password === 'ThisIsInvalid') {
            return res(
                ctx.status(422),
                ctx.json({
                    message: "The given data was invalid.",
                    errors: {
                        password: ["This is not valid."],
                        password_confirmation: ["This is also not valid."],
                    }
                })
            )
        } else if (req.body.password === 'unknown') {
            return res(
                ctx.status(500)
            )
        } else {
            return res(
                ctx.status(200),
                ctx.json({
                    success: true,
                })
            )
        }
    }),

    rest.get('/api/graph/token', (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json({
                token: {
                    access_token: 'abcdefghijklmnopqrstuvwxyz'
                }
            })
        )
    }),

    rest.get('/api/azure/sync', (req, res, ctx) => {
        return res(
            ctx.status(200),
        )
    }),

    rest.get('/api/group/mappings', (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json({
                mappings: [
                    { '9999': '000' }
                ]
            })
        )
    }),

    rest.get('https://graph.microsoft.com/v1.0/groups', (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json({
                "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#groups(id,displayName)",
                "value": [
                    {
                        "@odata.id": "#",
                        id: "000",
                        displayName: "Example"
                    },
                    {
                        "@odata.id": "#",
                        id: "001",
                        displayName: "Group 1"
                    }
                ]
            })
        )
    }),

    rest.post('/api/group/mapping', (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json({
                success: true
            })
        )
    }),

    rest.post('/api/media/upload', (req, res, ctx) => {
        return res(
            ctx.status(201),
            ctx.json({
                media: {
                    URL: 'http://somefakeimageURL.com',
                    filename: 'filename.jpg',
                    original_filename: 'image.jpg',
                    mime: 'image/jpeg',
                    size: '1 B',
                    user_id: 9999
                }
            })
        )
    })

];

const server = setupServer(...handlers);

export { server, rest };
