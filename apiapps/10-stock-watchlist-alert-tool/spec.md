# Stock Watchlist Alert Tool

## Tagline
Monitor your key stocks and get alerted the moment price, volume, or sentiment shifts matter.

## Target Market
Small business owners, independent financial advisors, and bootstrapped investors who track a focused list of equities without using a full brokerage platform.

## Problem
Retail investors and SMB owners who hold a small number of stocks need timely alerts without wading through the noise of full trading platforms. Free brokerage alert tools are basic, often require an active account, and lack customizable multi-condition triggers. Missing a significant move in a watched stock can cost real money.

## Solution
Users build a personal watchlist of stocks and configure alert rules with flexible conditions — price crossing a threshold, volume spikes, or daily percentage moves. Alerts are delivered via email or SMS with a one-line context summary.

## Core Features (MVP)
- Stock watchlist with up to 20 tickers and real-time quote display
- Alert rule builder: price threshold, % change, volume spike triggers
- Email and SMS alert delivery with market context summary
- 90-day price chart per ticker with alert markers
- Daily watchlist summary email at market open

## API Used
- Alpha Vantage API — provides real-time and historical stock quotes, technical indicators, and intraday time series data

## Monetization
Freemium — free for 5 tickers and email alerts only; Pro at $15/month for 20 tickers, SMS alerts, and daily digest.

## Tech Stack Suggestion
Next.js + Supabase + Resend + Twilio

## MVP Scope
Included in v1: watchlist management, price/percentage alert rules, email alerts, 90-day chart, daily summary email.
Out of scope: options/futures data, portfolio P&L tracking, news sentiment integration, brokerage account linking.
