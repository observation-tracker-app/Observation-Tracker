#!/bin/bash

# Generate a random secret for NEXTAUTH_SECRET
echo "Generating NEXTAUTH_SECRET..."
SECRET=$(openssl rand -base64 32)

echo ""
echo "Add this to your .env file:"
echo "NEXTAUTH_SECRET=\"$SECRET\""
echo ""
echo "Or run this command:"
echo "echo 'NEXTAUTH_SECRET=\"$SECRET\"' >> .env"
