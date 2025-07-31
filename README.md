`src/
│
├── app.module.ts              # Root module
├── main.ts                    # Application entry point
│
├── common/                    # Shared modules, pipes, guards, decorators, etc.
│   ├── decorators/
│   ├── guards/
│   ├── interceptors/
│   ├── pipes/
│   └── utils/                 # Utility functions and classes
│
├── config/                    # Configuration files
│   ├── database.config.ts
│   ├── jwt.config.ts
│   ├── mail.config.ts
│   └── app.config.ts          # General application configuration
│
├── modules/                   # Feature modules
│   ├── auth/                  # Authentication module
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.module.ts
│   │   ├── dto/               # Data Transfer Objects
│   │   ├── interfaces/        # Interfaces
│   │   ├── schemas/           # Database schemas (if using Mongoose/TypeORM)
│   │   └── strategies/        # Authentication strategies (e.g., JWT, Local)
│   │
│   ├── user/                  # User module
│   │   ├── user.controller.ts
│   │   ├── user.service.ts
│   │   ├── user.module.ts
│   │   ├── dto/
│   │   ├── interfaces/
│   │   └── schemas/
│   │
│   └── resto/                 # Restaurant module (or any other feature module)
│       ├── resto.controller.ts
│       ├── resto.service.ts
│       ├── resto.module.ts
│       ├── dto/
│       ├── interfaces/
│       └── schemas/
│
├── templates/                 # Email templates or other static files
│
└── tests/                     # Test files
    ├── unit/
    └── integration/`