const groups = [
    {
        "id": 9999,
        "name": "Mocked Group",
        "guard_name": "web",
        "created_at": null,
        "updated_at": null,
        "permissions": [
            {
                "id": 9999,
                "name": "mocked.permission",
                "title": "Mocked Permission",
                "guard_name": "web",
                "created_at": null,
                "updated_at": null,
                "pivot": {
                    "role_id": 9999,
                    "permission_id": 9999
                }
            }
        ]
    },
    {
        "id": 10000,
        "name": "Second Group",
        "guard_name": "web",
        "created_at": null,
        "updated_at": null,
        "permissions": [
            {
                "id": 9999,
                "name": "mocked.permission",
                "title": "Mocked Permission",
                "guard_name": "web",
                "created_at": null,
                "updated_at": null,
                "pivot": {
                    "role_id": 9999,
                    "permission_id": 9999
                }
            }
        ]
    },
    {
        "id": 1,
        "name": "Administrators",
        "guard_name": "web",
        "created_at": null,
        "updated_at": null,
        "permissions": [
            {
                "id": 1,
                "name": "admin.access",
                "title": "Administrative Access",
                "guard_name": "web",
                "created_at": null,
                "updated_at": null,
                "pivot": {
                    "role_id": 1,
                    "permission_id": 1
                }
            }
        ]
    }
];

const User = {
    id: 9999,
    username: 'test_user',
    password: 'jesting',
    name: 'Test Jest User',
    email: 'test@jest',
    active: true,
    azure_id: null,
    number_of_blocks: 40,
    roles: []
};

const users = [
    User,
    {
        id: 10002,
        username: 'jest4',
        password: 'alsojesting4',
        name: 'Jest Alternative User',
        email: 'jest@test',
        active: true,
        azure_id: 456,
        number_of_blocks: 1,
        roles: [
            groups[0]
        ]
    },
    {
        id: 10000,
        username: 'jest2',
        password: 'alsojesting',
        name: 'Jest Second User',
        email: 'jest@test',
        active: false,
        azure_id: 123,
        number_of_blocks: 0,
        roles: []
    },
    {
        id: 10001,
        username: 'jest3',
        password: 'alsojesting3',
        name: 'Jest Third User',
        email: 'jest@test',
        active: false,
        azure_id: 123,
        number_of_blocks: 0,
        roles: [
            groups[0]
        ]
    },
    {
        id: 90909,
        username: 'administrator',
        password: 'password123test',
        name: 'WebApps Administrator',
        email: 'admin@test',
        active: true,
        azure_id: null,
        number_of_blocks: 0,
        roles: [
            groups[2]
        ]
    }
]

const loginMethods = [
    {
        "title": "Internal Authentication",
        "value": "internal",
    },
    {
        "title": "Mock Single-Sign On",
        "value": "mocked",
    },
];

const permissions = {
    admin: {
        name: "Mocked Permissions Group",
        permissions: [
            {
                id: 9999,
                name: "mocked.permission",
                title: "Mocked Permission",
                guard_name: "web",
                created_at: null,
                updated_at: null
            }
        ]
    },
    mock: {
        name: "Second Group",
        permissions: [
            {
                id: 10000,
                name: "second.permission",
                title: "Second Permission",
                guard_name: "web",
                created_at: null,
                updated_at: null
            },
            {
                id: 1,
                name: "admin.access",
                title: "Administrative Access",
                guard_name: "web",
                created_at: null,
                updated_at: null
            }
        ]
    }
};

const settings = {
    "core.mocked.data_mocked": "true",
    "core.ui.theme": 'indigo',
    "core.ui.branding": "[\"#EEF2FF\", \"#E0E7FF\", \"#C7D2FE\", \"#A5B4FC\", \"#818CF8\", \"#6366F1\", \"#4F46E5\", \"#4338CA\", \"#3730A3\", \"#312E81\"]",
    "core.cms.display_link": 'true',
    "auth.internal.registrations": 'true',
    "auth.internal.default_group": groups[0].name,
    "azure.graph.tenant": '',
    "azure.graph.client_id": '',
    "azure.graph.client_secret": '',
    "mail.driver": 'smtp',
};

const navigation = {
    navigation: [
        { _tag: "NavItem", name: "Test Nav", to: "/test", icon: ["fas", "star"] }
    ],
    routes: [
        { path: "/test", name: "Test", component: "Dashboard" }
    ]
};

const apps = [
    { id: 1, name: "Demo App", slug: "demoApp", icon: "[\"fas\", \"ghost\"]", version: "1.0.0", author: "WebApps", menu: [], routes: [] }
];

const plugins = [
    { id: 1, name: "Sample", slug: "Sample", icon: "[\"fas\", \"star\"]", version: "1.0.0", author: "WebApps", state: 1 },
    { id: 2, name: "Jest", slug: "Jest", icon: "[\"fas\", \"star\"]", version: "1.0.0", author: "WebApps", state: 1 }
];

const blocks = [
    { 
        id: 1,
        owner: 9999,
        plugin: plugins[0],
        settings: { 
            message: "1234" 
        },
        publicId: "testBlock",
        title: "Test Block",
        notes: "Jesting",
        created_at: "0000-00-00T00:00:00.000000Z",
        updated_at: "0000-00-00T00:00:00.000000Z",
        views: 0,
        scripts: "",
        edit: false,
        output: "<div class=\"Sample\"><h1>1234<\/h1><\/div>",
        options: { 
            message: { 
                type: "text",
                label: "Enter the sample message",
                maxlength: 255,
                required: true
            }
        },
        user: User,
        preview: "<h1 data-val=\"value.message\" \/>",
        number_of_blocks: 1
    },
    { 
        id: 2,
        owner: 9999,
        plugin: plugins[0],
        settings: { 
            message: "4321" 
        },
        publicId: "Test-Block-2",
        notes: "Jesting",
        created_at: "0000-00-00T00:00:00.000000Z",
        updated_at: "0000-00-00T00:00:00.000000Z",
        views: 100,
        scripts: "",
        edit: false,
        output: "<div class=\"Sample\"><h1>4321<\/h1><\/div>",
        options: { 
            message: { 
                type: "text",
                label: "Enter the sample message",
                maxlength: 255,
                required: true
            }
        },
        user: User,
        preview: "<h1 data-val=\"value.message\" \/>",
        number_of_blocks: 50
    }
]

export {
    User,
    users,
    loginMethods,
    groups,
    permissions,
    navigation,
    apps,
    plugins,
    settings,
    blocks
}