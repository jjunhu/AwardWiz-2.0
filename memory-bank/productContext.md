# AwardWiz Product Context

## Why This Project Exists

AwardWiz addresses a significant pain point for travelers who use points and miles: the difficulty of finding and booking award flights and hotel stays due to limited availability and fluctuating prices. It serves as a specialized search tool that helps users:

1. **Find hidden award availability**: Airlines and hotels often restrict award inventory, making it hard to find available options without manually checking multiple websites.

2. **Optimize points usage**: By identifying "saver" awards and low-point redemptions, users can maximize the value of their loyalty currencies.

3. **Save time**: Instead of manually checking multiple airline and hotel websites daily, users can set up alerts and be notified when availability opens.

## Problems It Solves

### For Travelers
1. **Award Seat Scarcity**: Premium cabin awards (business/first class) are often limited and quickly claimed. AwardWiz monitors these continuously to catch when they become available.

2. **Dynamic Pricing**: Airlines increasingly use dynamic pricing for awards, causing point costs to fluctuate. AwardWiz can alert users when prices drop below their target threshold.

3. **Complex Booking Rules**: Different loyalty programs have varying rules for partner awards. AwardWiz helps users discover options they might otherwise miss.

4. **Manual Monitoring Burden**: Without automation, users would need to repeatedly check multiple websites for availability changes.

### For Developers
1. **Anti-Scraping Measures**: Airlines employ sophisticated anti-botting technologies. The Arkalis engine is specifically designed to overcome these obstacles.

2. **Data Consistency**: Each airline presents data differently. AwardWiz standardizes this information into a consistent format.

## How It Should Work

From a user perspective:

1. **Search**: User enters origin, destination, and dates to search across multiple airlines simultaneously.

2. **Monitor**: User marks specific routes, dates, and cabins they want to monitor, setting point thresholds if desired.

3. **Alert**: When availability opens that matches their criteria, users receive timely notifications via email or SMS.

4. **Book**: Users can click through to the respective airline/hotel website to complete their booking.

From a technical perspective:

1. **Scraping**: The system periodically queries airline and hotel websites through specialized scrapers that mimic human behavior to avoid detection.

2. **Processing**: Data is normalized, filtered for relevant information, and compared against user preferences.

3. **Storage**: User preferences and alert settings are stored in Firebase, while scraped data is processed but not permanently stored.

4. **Notification**: When matches are found, the system dispatches notifications through appropriate channels.

## User Experience Goals

1. **Simplicity**: Users should be able to set up searches and alerts with minimal effort.

2. **Transparency**: Clear information about what's being monitored and when notifications will be sent.

3. **Reliability**: Alerts should be timely and accurate, with minimal false positives.

4. **Efficiency**: Fast searches that cover multiple airlines and hotels without requiring multiple manual checks.

5. **Control**: Users should be able to easily manage their alerts, pausing or deleting them as needed.

6. **Privacy**: User data and search preferences should be securely handled.

## Target Use Cases

1. **Aspirational Travel Planning**: Users planning premium cabin trips using points for special occasions.

2. **Opportunistic Booking**: Users flexible on destinations but wanting to maximize point value.

3. **Date-Specific Travel**: Users with fixed travel dates who need to find award availability.

4. **Threshold-Based Alerts**: Users waiting for award rates to drop below a specific number of points.
