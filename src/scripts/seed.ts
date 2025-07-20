import db from "@/lib/database";
import { userTable, socialMediaTable } from "@/lib/database/schema";
import { faker } from "@faker-js/faker";

async function seed() {
    const args = process.argv.slice(2);
    const shouldRefresh = args.includes("--refresh");
    const countIndex = args.indexOf("--count");

    let userCount = 10; // Default user count
    if (countIndex !== -1 && args[countIndex + 1]) {
        const parsedCount = parseInt(args[countIndex + 1]);
        if (!isNaN(parsedCount) && parsedCount > 0) {
            userCount = parsedCount;
        }
    }

    if (shouldRefresh) {
        console.log(
            "Refreshing database: deleting all users and social media links..."
        );
        await db.delete(socialMediaTable);
        await db.delete(userTable);
        console.log("Database refreshed successfully!");
    }

    type TUser = (typeof userTable)["$inferInsert"];

    const normalUsersCount = Math.floor(userCount / 2);
    const longDataUsersCount = Math.ceil(userCount / 2);

    // Generate normal users
    const normalUsers: TUser[] = [];
    for (let i = 0; i < normalUsersCount; i++) {
        normalUsers.push({
            name: faker.person.fullName(),
            email: faker.internet.email(),
            picture: faker.image.avatar(),
            title: faker.person.jobTitle(),
            role: "USER",
        });
    }

    // Generate users with long names and titles
    const longDataUsers: TUser[] = [];
    for (let i = 0; i < longDataUsersCount; i++) {
        longDataUsers.push({
            name: `${faker.person.fullName()} ${faker.lorem.words(5)}`,
            email: faker.internet.email(),
            picture: faker.image.avatar(),
            title: `${faker.person.jobTitle()} ${faker.lorem.words(3)}`,
            role: "USER",
        });
    }

    const allUsers = [...normalUsers, ...longDataUsers];

    if (allUsers.length === 0) {
        console.log("No users to seed.");
        return;
    }

    console.log(`Seeding database with ${allUsers.length} new users...`);
    const insertedUsers = await db
        .insert(userTable)
        .values(allUsers)
        .returning({ id: userTable.id });
    console.log("Users seeded successfully!");

    // Generate social media links for each user
    type TSocialMedia = (typeof socialMediaTable)["$inferInsert"];
    const socialMediaLinks: TSocialMedia[] = [];
    const socialPlatforms = [
        "github",
        "linkedin",
        "x",
        "instagram",
        "facebook",
        "tiktok",
        "youtube",
        "personal website",
    ];

    for (const user of insertedUsers) {
        const linksCount = faker.number.int({ min: 1, max: 4 });
        for (let i = 0; i < linksCount; i++) {
            socialMediaLinks.push({
                userId: user.id,
                platform: faker.helpers.arrayElement(socialPlatforms),
                link: faker.internet.url(),
            });
        }
    }

    if (socialMediaLinks.length > 0) {
        console.log(`Seeding ${socialMediaLinks.length} social media links...`);
        await db.insert(socialMediaTable).values(socialMediaLinks);
        console.log("Social media links seeded successfully!");
    }
}

seed().catch((err) => {
    console.error("Error seeding database:", err);
    process.exit(1);
});
