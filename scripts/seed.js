const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ildxgsvyvoipgoynijja.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '<YOUR_SUPABASE_SERVICE_ROLE_KEY>';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const randomNames = [
  'Alex Rivera',
  'Jordan Chen',
  'Taylor Morgan',
  'Casey Johnson',
  'Morgan Williams',
  'Phoenix Lee',
  'Riley Martinez',
  'Sam Taylor',
];

function getRandomName() {
  return randomNames[Math.floor(Math.random() * randomNames.length)];
}

const agents = [
  {
    title: 'Customer Feedback Processor',
    description:
      'Intelligent agent that processes customer service emails, categorizes feedback, distributes to appropriate teams via Slack MCP, tracks responses, and communicates resolutions back to customers.',
    category: ['Customer Support', 'Automation'],
    tags: ['slack', 'mcp', 'customer-service', 'email', 'automation', 'feedback'],
    claude_md_file: 'customer-feedback-processor.md',
    repository_url: 'https://github.com/agentstack/customer-feedback-processor',
    homepage_url: 'https://agentstack.dev/agents/customer-feedback',
    license: 'MIT',
    version: '1.0.0',
    verified: true,
    featured: true,
  },
  {
    title: 'AI Job Search Assistant',
    description:
      'Automated agent for discovering AI/ML job opportunities across multiple job boards. Searches for hybrid and onsite positions, tailor resumes by job requirements, generates personalized cover letters, and tracks applications with detailed analytics.',
    category: ['Automation', 'Research'],
    tags: ['job-search', 'ai', 'ml', 'career', 'resume', 'automation', 'web-scraping'],
    claude_md_file: 'ai-job-search.md',
    repository_url: 'https://github.com/agentstack/ai-job-assistant',
    homepage_url: 'https://agentstack.dev/agents/job-search',
    license: 'MIT',
    version: '1.0.0',
    verified: true,
    featured: true,
  },
  {
    title: 'Code Documentation Generator',
    description:
      'Automatically generates comprehensive documentation for Python and JavaScript projects. Analyzes code structure, extracts docstrings, creates API references, and generates formatted markdown documentation.',
    category: ['Code Generation', 'Documentation'],
    tags: ['documentation', 'code-analysis', 'python', 'javascript', 'automation'],
    repository_url: 'https://github.com/agentstack/code-doc-generator',
    homepage_url: 'https://agentstack.dev/agents/doc-generator',
    license: 'Apache 2.0',
    version: '1.2.1',
    verified: true,
    featured: false,
  },
  {
    title: 'Market Research Assistant',
    description:
      'Conducts comprehensive market research by web scraping, analyzing competitor data, identifying trends, and generating actionable insights. Perfect for business strategy and product decisions.',
    category: ['Research', 'Data Analysis'],
    tags: ['market-research', 'web-scraping', 'analysis', 'business-intelligence'],
    repository_url: 'https://github.com/agentstack/market-research',
    homepage_url: null,
    license: 'MIT',
    version: '0.9.2',
    verified: false,
    featured: false,
  },
  {
    title: 'Social Media Content Planner',
    description:
      'AI-powered content calendar and planner that generates post ideas, creates copy variations, schedules across platforms, and analyzes engagement metrics. Supports Instagram, Twitter, LinkedIn, and TikTok.',
    category: ['Content Creation'],
    tags: ['social-media', 'content-creation', 'automation', 'marketing'],
    repository_url: 'https://github.com/agentstack/social-planner',
    license: 'MIT',
    version: '1.1.0',
    verified: true,
    featured: false,
  },
  {
    title: 'Data Analysis Agent',
    description:
      'Processes CSV and Excel files, performs statistical analysis, generates visualizations, creates summary reports, and identifies key trends in your data.',
    category: ['Data Analysis'],
    tags: ['data-analysis', 'statistics', 'visualization', 'csv', 'excel'],
    repository_url: 'https://github.com/agentstack/data-analyzer',
    license: 'GPL 3.0',
    version: '1.0.5',
    verified: true,
    featured: false,
  },
  {
    title: 'Email Classifier & Triage',
    description:
      'Automatically classifies incoming emails by priority, subject, and sender. Routes urgent messages to appropriate teams, generates summaries, and creates follow-up tasks.',
    category: ['Automation', 'Customer Support'],
    tags: ['email', 'automation', 'triage', 'workflow'],
    repository_url: 'https://github.com/agentstack/email-classifier',
    license: 'MIT',
    version: '1.0.3',
    verified: true,
    featured: false,
  },
  {
    title: 'API Response Validator',
    description:
      'Tests API endpoints, validates response schemas, checks for errors, and generates detailed test reports. Supports REST, GraphQL, and WebSocket APIs.',
    category: ['Code Generation', 'Automation'],
    tags: ['api-testing', 'validation', 'rest', 'graphql', 'automation'],
    repository_url: 'https://github.com/agentstack/api-validator',
    license: 'MIT',
    version: '0.8.1',
    verified: false,
    featured: false,
  },
];

async function seedDatabase() {
  console.log('🌱 Starting database seeding...\n');

  try {
    // Step 1: Create first user (customer feedback agent creator)
    console.log('📝 Creating user accounts...');
    const user1Data = {
      email: 'aluminus99@gmail.com',
      password: 'Abcde@12345',
      email_confirm: true,
    };

    const user2Data = {
      email: 'mananmaroo99@gmail.com',
      password: 'Abcde@12345',
      email_confirm: true,
    };

    // Create auth users using service role key
    let user1Id, user2Id;

    try {
      // Try to create first user
      const { data: user1, error: user1Error } = await supabase.auth.admin.createUser({
        email: user1Data.email,
        password: user1Data.password,
        email_confirm: true,
      });

      if (user1Error) {
        console.log(`ℹ User already exists: ${user1Data.email}`);
      } else {
        user1Id = user1.user.id;
      }
      console.log(`✓ User: ${user1Data.email}`);

      // Try to create second user
      const { data: user2, error: user2Error } = await supabase.auth.admin.createUser({
        email: user2Data.email,
        password: user2Data.password,
        email_confirm: true,
      });

      if (user2Error) {
        console.log(`ℹ User already exists: ${user2Data.email}`);
      } else {
        user2Id = user2.user.id;
      }
      console.log(`✓ User: ${user2Data.email}\n`);
    } catch (error) {
      console.error(`⚠ User creation error: ${error.message}`);
    }

    // Fetch user IDs from auth system
    const { data: { users: authUsers }, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
      console.error(`❌ Error fetching auth users: ${listError.message}`);
      process.exit(1);
    }

    user1Id = authUsers.find((u) => u.email === user1Data.email)?.id;
    user2Id = authUsers.find((u) => u.email === user2Data.email)?.id;

    if (!user1Id || !user2Id) {
      console.error('❌ Could not find users in auth system');
      process.exit(1);
    }

    console.log('✓ User IDs resolved\n');

    // Step 2: Create user profiles
    console.log('👤 Creating user profiles...');

    const userName1 = getRandomName().replace(' ', '').toLowerCase();
    const userName2 = getRandomName().replace(' ', '').toLowerCase();

    // Check if profiles already exist
    const { data: existingProfiles } = await supabase
      .from('users')
      .select('id')
      .in('id', [user1Id, user2Id]);

    if (!existingProfiles || existingProfiles.length < 2) {
      await supabase.from('users').insert([
        {
          id: user1Id,
          username: userName1,
          email: user1Data.email,
          bio: 'AI Agent Developer specializing in customer service automation',
        },
        {
          id: user2Id,
          username: userName2,
          email: user2Data.email,
          bio: 'AI Engineer and Data Scientist focused on job search automation',
        },
      ]);
    }

    console.log(`✓ User 1: ${userName1} (${user1Data.email})`);
    console.log(`✓ User 2: ${userName2} (${user2Data.email})\n`);

    // Step 3: Insert sample agents
    console.log('🤖 Seeding agents...\n');

    // First two agents go to our specific users
    const agentData = [
      {
        ...agents[0], // Customer Feedback Processor
        creator_id: user1Id,
      },
      {
        ...agents[1], // AI Job Search Assistant
        creator_id: user2Id,
      },
      ...agents.slice(2).map((agent, index) => ({
        ...agent,
        creator_id: index % 2 === 0 ? user1Id : user2Id,
      })),
    ];

    // Insert agents
    const agentsToInsert = agentData.map((agent) => ({
      title: agent.title,
      description: agent.description,
      category: agent.category,
      tags: agent.tags,
      creator_id: agent.creator_id,
      claude_md_file: agent.claude_md_file || null,
      repository_url: agent.repository_url || null,
      homepage_url: agent.homepage_url || null,
      license: agent.license,
      version: agent.version,
      verified: agent.verified,
      featured: agent.featured,
      downloads_count: Math.floor(Math.random() * 500),
      views_count: Math.floor(Math.random() * 2000),
      average_rating: (Math.random() * 2 + 3.5).toFixed(1),
      rating_count: Math.floor(Math.random() * 50),
    }));

    const { error: insertError } = await supabase.from('agents').insert(agentsToInsert);

    if (insertError) {
      console.log(`⚠ Could not insert agents: ${insertError.message}`);
    } else {
      agentData.forEach((agent) => {
        console.log(`✓ ${agent.title}`);
      });
    }

    console.log(`\n✅ Database seeded successfully!\n`);
    console.log('📊 Summary:');
    console.log(`  • Created 2 user accounts`);
    console.log(`  • Seeded ${agentData.length} agents`);
    console.log(`  • User 1 owns: Customer Feedback Processor + alternating agents`);
    console.log(`  • User 2 owns: AI Job Search Assistant + alternating agents\n`);

    console.log('🔐 Login credentials:');
    console.log(`  Account 1: ${user1Data.email} / Abcde@12345`);
    console.log(`  Account 2: ${user2Data.email} / Abcde@12345\n`);

    console.log('🚀 Try these URLs:');
    console.log(`  • Browse: http://localhost:3000/agents`);
    console.log(`  • Login: http://localhost:3000/auth/login`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
}

seedDatabase();
