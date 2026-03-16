# System Flow

## Customer Flow
1. Customer scans shop QR code.
2. They open the shop landing page.
3. They select service and branch.
4. They join queue using GraphQL mutation.
5. They track status via live GraphQL updates.

## Barber Flow
1. Barber/owner opens admin dashboard.
2. They view active queue entries and stats.
3. They call next customer.
4. They mark current customer as served.
5. Queue status broadcasts to customers and display.

## Queue Display Flow
1. Queue display app loads with shop ID.
2. It queries active queue and subscribes to updates.
3. It renders NOW SERVING, NEXT CUSTOMER, WAITING LIST.
4. It refreshes automatically via queue subscription events.
