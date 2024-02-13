module.exports = [
    {
        id: 1,
        title: 'Platform Owner',
        scopes: JSON.stringify([
            'full-access',
            'admin-access',
            'associate-access',
        ]),
        created_at: new Date(),
        updated_at: new Date(),
    },
    {
        id: 2,
        title: 'Admin',
        scopes: JSON.stringify(['admin-access', 'associate-access']),
        created_at: new Date(),
        updated_at: new Date(),
    },
    {
        id: 3,
        title: 'Associate',
        scopes: JSON.stringify(['associate-access']),
        created_at: new Date(),
        updated_at: new Date(),
    },
]
