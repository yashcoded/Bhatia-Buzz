/**
 * Test data fixtures
 */
export const testUsers = {
  regular: {
    email: 'testuser@example.com',
    password: 'TestPassword123!',
    displayName: 'Test User',
  },
  admin: {
    email: 'admin@example.com',
    password: 'AdminPassword123!',
    displayName: 'Admin User',
  },
};

export const testPosts = {
  sample: {
    content: 'This is a test post for E2E testing',
    imageUrl: 'https://via.placeholder.com/400',
  },
};

export const testRequests = {
  condolence: {
    title: 'Test Condolence Request',
    description: 'This is a test condolence request for E2E testing',
    type: 'condolence' as const,
  },
  celebration: {
    title: 'Test Celebration Request',
    description: 'This is a test celebration request for E2E testing',
    type: 'celebration' as const,
  },
};

export const testMatrimonialProfile = {
  personalInfo: {
    name: 'Test Matrimonial User',
    age: 28,
    gender: 'male' as const,
    education: 'Bachelor\'s Degree',
    occupation: 'Software Engineer',
    height: '5\'10"',
    location: 'New York, USA',
    bio: 'Test bio for matrimonial profile',
  },
  familyInfo: {
    fatherName: 'Test Father',
    motherName: 'Test Mother',
    siblings: 2,
    familyBackground: 'Test family background',
  },
  preferences: {
    minAge: 25,
    maxAge: 35,
    education: ['Bachelor\'s Degree', 'Master\'s Degree'],
    location: ['New York', 'California'],
    other: 'Test preferences',
  },
};

