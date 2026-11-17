# RetailIQ – Smart Customer Analytics

**Retail Customer Segmentation and Purchase Prediction Using Machine Learning**  
*Tagline: Understand Customers. Predict Purchases. Grow Business.*  
*Domain: Artificial Intelligence, Machine Learning, Data Analytics*  
*Prepared for: VTU Engineering Mini Project / Academic Evaluation & Viva Voce*

---

## 1. Project Overview & Abstract

**RetailIQ** is an end-to-end intelligent retail customer intelligence web application. Retailers often struggle to identify high-value customer groups, detect disengagement early, and predict forward purchase likelihood. 

RetailIQ solves this challenge by integrating:
1. **Unsupervised K-Means Clustering** on Recency, Frequency, and Monetary (RFM) matrices to categorize customer cohorts (Champions, Loyalists, At-Risk, New Customers).
2. **Supervised Random Forest Classifier** for 30-day forward repurchase probability prediction, trained with strict chronological slicing to avoid lookahead bias.
3. **Advanced Customer Analytics**: Customer Lifetime Value (CLV), Operational Churn Risk analysis, Market Basket Analysis (Association Rules with Lift and Confidence), and Monthly Sales Velocity forecasting.
4. **Dual Operational Modes**:
   - **Simple Business Mode**: Intuitive for non-technical shop owners with zero mathematical jargon and direct action steps.
   - **Expert Analyst Mode**: Comprehensive mathematical telemetry including Inertia, Elbow plots, Silhouette scores, Confusion Matrix ($TP, FP, TN, FN$), ROC-AUC curves, and Gini Feature Importance.
5. **Role-Based Access Control (RBAC)**: Distinct permissions and views for **Retailer**, **Data Analyst**, and **Administrator**.

---

## 2. Dataset Specification: UCI Online Retail II

RetailIQ is natively built around the **UCI Online Retail II Repository** benchmark dataset:
- **Source**: UCI Machine Learning Repository (Online Retail II: 2009-2010 transactions)
- **Standard Columns**:
  - `Invoice`: 6-digit order identifier (cancellations prefixed with `'C'`)
  - `StockCode`: 5-digit item code
  - `Description`: Product catalog name
  - `Quantity`: Number of units ordered (negative denotes returns)
  - `InvoiceDate`: Timestamp of order creation
  - `Price`: Unit price in GBP (£)
  - `Customer ID`: 5-digit unique client identifier
  - `Country`: Geographical destination market
- **Pre-Processing Pipeline**:
  - Drops rows with missing `Customer ID` (guest checkouts)
  - Flags and isolates cancellations (`Invoice.startsWith('C')`)
  - Removes non-positive prices and duplicate order line-items
  - Derives `TotalAmount = Quantity * Price`

---

## 3. Technology Stack & Architecture

- **Frontend Application**:
  - React 19 + TypeScript (SPA)
  - Tailwind CSS v4 with custom dark mode variants
  - Lucide React Iconography
  - Recharts for data visualization (Elbow, Silhouette, Scatter, Area, Donut, Bar)
  - SheetJS (`xlsx`) & PapaParse for CSV/Excel dataset upload and export
- **Machine Learning & Analytics Engine**:
  - RFM Feature Extraction & Log-transformation ($\ln(1 + x)$) to handle skewness
  - Configurable F1/F2/F3 customer grading from dataset-specific RFM percentile ranks (top, middle, and low-activity groups)
  - StandardScaler (z-score normalization: $\frac{x - \mu}{\sigma}$)
  - K-Means Clustering ($K=2..7$) with Silhouette Coefficient & Elbow Inertia
  - Random Forest Classifier with bootstrap sampling and Gini impurity splits
  - Market Basket Apriori-style Association Rules (Support, Confidence, Lift)
  - 3-Month Sales Trend Forecasting with 95% confidence intervals

---

## 4. Role-Based Access Control (RBAC) & Demo Logins

For VTU viva demonstration and academic evaluation, 1-click preset logins are integrated in the top navigation bar:

| Role | Demo Account | Permissions |
| :--- | :--- | :--- |
| **Retailer / Owner** | `retailer@retailiq.ai` | Upload datasets, clean sales, view executive dashboard, inspect segment recommendations, run purchase predictions, export business reports. |
| **Data Analyst** | `analyst@retailiq.ai` | Preprocess RFM features, tune K-Means hyperparameters, evaluate Random Forest (Confusion matrix, ROC-AUC, Gini importance), export raw metrics. |
| **Administrator** | `admin@retailiq.ai` | User provisioning, activate/deactivate accounts, manage storage cache, inspect system audit trail, monitor model versions. |

---

## 5. Mathematical Formulations (Viva Reference)

### 1. RFM Definitions
- $\text{Recency } (R) = t_{\text{ref}} - t_{\text{lastPurchase}} \text{ (days)}$
- $\text{Frequency } (F) = \text{Count of unique valid invoices}$
- $\text{Monetary } (M) = \sum (\text{Quantity}_i \times \text{Price}_i)$
- $\text{Average Order Value } (AOV) = \frac{M}{F}$

### 2. K-Means Inertia (Within-Cluster Sum of Squares)
$$J = \sum_{k=1}^{K} \sum_{x \in C_k} ||x - \mu_k||^2$$

### 3. Silhouette Coefficient
$$s(i) = \frac{b(i) - a(i)}{\max(a(i), b(i))}$$
Where $a(i)$ is mean intra-cluster distance and $b(i)$ is mean nearest-cluster distance.

### 4. Decision Tree Gini Impurity
$$\text{Gini}(D) = 1 - \sum_{k=1}^{C} p_k^2$$

### 5. Classification Performance Metrics
- $\text{Accuracy} = \frac{TP + TN}{TP + TN + FP + FN}$
- $\text{Precision} = \frac{TP}{TP + FP}$
- $\text{Recall} = \frac{TP}{TP + FN}$
- $\text{F1-Score} = \frac{2 \times \text{Precision} \times \text{Recall}}{\text{Precision} + \text{Recall}}$

---

## 6. Local Setup and Installation (Windows / VS Code)

### Prerequisites:
- Node.js (v18 or higher)
- npm or yarn

### Steps to Run:
```bash
# 1. Clone or extract project repository
cd retailiq

# 2. Install all dependencies
npm install

# 3. Start local development server
npm run dev
```

Open your browser at `http://localhost:3000` to interact with RetailIQ.

---

## 7. Project Features Checklist

- [x] Pre-loaded with authentic UCI Online Retail II dataset sample
- [x] Drag & drop CSV and Excel (.xlsx, .xls) upload with automatic column mapping
- [x] Comprehensive data cleaning audit (before vs after summary)
- [x] Executive KPI dashboard (Revenue, Customers, Orders, AOV, Repeat Rate)
- [x] K-Means clustering with Elbow Method and Silhouette scores
- [x] Dynamic segment labeling (Champions, Loyalists, At-Risk, New Customers)
- [x] Configurable, data-driven F1/F2/F3 customer grading with distribution charts, filters, and CSV/Excel reports
- [x] 30-Day Random Forest Purchase Prediction with probability meter
- [x] Interactive "What-If" customer simulator
- [x] Dedicated Model Evaluation page (Confusion Matrix, ROC Curve, Feature Importance)
- [x] Operational Churn Risk and Customer Lifetime Value (CLV)
- [x] Market Basket Association Rules (Lift, Confidence, Support)
- [x] Multi-format export: CSV, Multi-sheet Excel (.xlsx), and Printable PDF dossier
- [x] RBAC: Retailer, Data Analyst, Administrator with instant demo switcher
