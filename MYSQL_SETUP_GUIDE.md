# MySQL Database Setup for Digital Ocean Deployment

## Digital Ocean Managed MySQL Setup

### Step 1: Create MySQL Database
1. **Go to Digital Ocean Dashboard**
   - Navigate to "Databases" section
   - Click "Create Database"

2. **Configure Database**
   - **Engine**: MySQL
   - **Version**: 8.0 (latest stable)
   - **Datacenter Region**: Choose same region as your app
   - **Plan**: Basic ($5/month for development)
   - **CPU**: 1 vCPU
   - **Memory**: 1 GB RAM
   - **Storage**: 10 GB SSD

3. **Database Settings**
   - **Cluster Name**: `coffeehybrid-mysql`
   - **Database Name**: `coffeehybrid`
   - **Default User**: Will be auto-generated

### Step 2: Get Connection Details
After database creation, you'll get:
```
Host: coffeehybrid-mysql-do-user-xxxxx-0.b.db.ondigitalocean.com
Port: 25060
Database: coffeehybrid
Username: doadmin
Password: [auto-generated-password]
```

### Step 3: Configure Environment Variables
Use these connection details in your Digital Ocean App:

```bash
DB_HOST=coffeehybrid-mysql-do-user-xxxxx-0.b.db.ondigitalocean.com
DB_PORT=25060
DB_NAME=coffeehybrid
DB_USER=doadmin
DB_PASSWORD=your-generated-password
```

### Step 4: Security Configuration
1. **Trusted Sources**: Add your Digital Ocean App to trusted sources
2. **Firewall Rules**: Digital Ocean automatically configures this
3. **SSL**: Enabled by default

## Alternative: External MySQL Providers

### Option 1: PlanetScale (Free Tier Available)
1. Sign up at planetscale.com
2. Create new database
3. Get connection string
4. Use serverless driver for better performance

### Option 2: AWS RDS MySQL
1. Create RDS MySQL instance
2. Configure security groups
3. Allow Digital Ocean IP ranges
4. Use connection pooling

### Option 3: Google Cloud SQL
1. Create Cloud SQL MySQL instance
2. Configure authorized networks
3. Enable SSL connections
4. Use private IP if possible

## Database Schema
Your CoffeeHybrid project uses these main tables:
- `users` - User accounts and authentication
- `products` - Coffee products and menu items
- `orders` - Customer orders
- `cart_items` - Shopping cart data
- `sellers` - Seller/admin accounts
- `addons` - Product add-ons and customizations

The database schema will be automatically created when your backend starts.

## Connection Testing

### Test from Local Environment
```javascript
const mysql = require('mysql2/promise');

const testConnection = async () => {
  try {
    const connection = await mysql.createConnection({
      host: 'your-host',
      port: 25060,
      user: 'doadmin',
      password: 'your-password',
      database: 'coffeehybrid',
      ssl: {
        rejectUnauthorized: false
      }
    });
    
    console.log('✅ Database connected successfully');
    await connection.end();
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  }
};

testConnection();
```

### Test from Digital Ocean App
Check your backend service logs for database connection status:
```
✅ Database connected successfully
🔄 Syncing database models...
✅ Database synchronized
```

## Performance Optimization

### Connection Pooling
Your backend automatically uses connection pooling with these settings:
```javascript
{
  max: 10,          // Maximum connections
  min: 0,           // Minimum connections
  acquire: 30000,   // Timeout for acquiring connection
  idle: 10000       // Timeout for idle connections
}
```

### Indexing
Key indexes are automatically created:
- Primary keys on all tables
- Foreign key indexes
- Indexes on frequently queried columns (email, order_id, etc.)

## Backup and Recovery

### Automated Backups
Digital Ocean provides:
- **Daily automated backups** (retained for 7 days)
- **Point-in-time recovery** (up to 7 days)
- **Manual snapshots** (custom retention)

### Manual Backup
```bash
mysqldump -h your-host -P 25060 -u doadmin -p coffeehybrid > backup.sql
```

### Restore from Backup
```bash
mysql -h your-host -P 25060 -u doadmin -p coffeehybrid < backup.sql
```

## Monitoring

### Digital Ocean Monitoring
- **CPU Usage**: Monitor database load
- **Memory Usage**: Watch for memory leaks
- **Disk Usage**: Monitor storage consumption
- **Connection Count**: Track active connections

### Query Performance
- Use `EXPLAIN` for slow queries
- Monitor query execution time
- Set up slow query log if needed

## Troubleshooting

### Common Issues

#### Connection Timeout
```
Error: connect ETIMEDOUT
```
**Solution**: Check firewall settings and network connectivity

#### SSL Certificate Issues
```
Error: unable to verify the first certificate
```
**Solution**: Update SSL configuration or disable strict SSL

#### Too Many Connections
```
Error: Too many connections
```
**Solution**: Increase connection pool limits or database max connections

#### Authentication Failed
```
Error: Access denied for user
```
**Solution**: Verify username/password and user permissions

### Debug Connection
Add debug logging to your backend:
```javascript
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_USER:', process.env.DB_USER);
// Don't log password in production!
```

## Cost Optimization

### Development
- Use **Basic plan** ($5/month)
- **1 GB RAM** is sufficient for development
- **10 GB storage** covers most small applications

### Production Scaling
- Upgrade to **Standard plan** for better performance
- Consider **read replicas** for high-traffic applications
- Monitor and scale based on actual usage

---

**💡 Tip**: Start with Digital Ocean Managed MySQL for simplicity. You can always migrate to other providers later if needed.
