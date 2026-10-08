"""007 - Add citizen_complaints table for public waterlogging complaint module

Revision ID: 007_citizen_complaints
Revises: 006_add_simulation_tables
Create Date: 2026-09-12

Citizens can file real-world waterlogging reports in Chennai.
This table stores the complaint record, verification status, crew assignment,
spam/duplicate detection, and privacy-protected contact details.

IMPORTANT: New complaints start as CITIZEN REPORTED / UNVERIFIED.
They do NOT automatically become official incidents.
"""

from alembic import op
import sqlalchemy as sa
from datetime import datetime, timezone

# revision identifiers
revision = '007_citizen_complaints'
down_revision = '006_add_simulation_tables'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Create the citizen_complaints table with all required fields."""

    op.create_table(
        'citizen_complaints',

        # Primary Key
        sa.Column('id', sa.Integer(), nullable=False, primary_key=True, autoincrement=True),

        # Unique Complaint Identifier (CP-CHN-XXXXXX)
        sa.Column('complaint_id', sa.String(50), nullable=False, unique=True),

        # Geographic Location (mandatory for Chennai boundary validation)
        sa.Column('latitude', sa.Float(), nullable=False),
        sa.Column('longitude', sa.Float(), nullable=False),
        sa.Column('area', sa.String(150), nullable=False),
        sa.Column('street', sa.String(200), nullable=True),
        sa.Column('zone_id', sa.Integer(), nullable=True),
        sa.Column('ward_id', sa.Integer(), nullable=True),

        # Waterlogging Details
        sa.Column('severity', sa.String(20), nullable=False),        # Low, Moderate, Severe
        sa.Column('water_depth', sa.String(50), nullable=True),       # e.g. "1 ft", "Knee deep"
        sa.Column('duration', sa.String(50), nullable=True),          # e.g. "2 hours", "Since morning"
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('road_blocked', sa.String(10), nullable=False, server_default='Unknown'),
        sa.Column('emergency_access_affected', sa.String(10), nullable=False, server_default='Unknown'),
        sa.Column('photo_path', sa.String(255), nullable=True),

        # Privacy-Protected Citizen Contact (visible ONLY to authorized ops staff, never on public map)
        sa.Column('citizen_name', sa.String(100), nullable=True),
        sa.Column('citizen_contact', sa.String(50), nullable=True),

        # Operational Status Workflow
        # SUBMITTED → RECEIVED → UNDER REVIEW → ASSIGNED → ACTION IN PROGRESS → RESOLVED / REJECTED
        sa.Column('status', sa.String(30), nullable=False, server_default='SUBMITTED'),

        # Verification Status
        # UNVERIFIED → VERIFIED INCIDENT  (manual ops verification required — never auto-converted)
        sa.Column('verification_status', sa.String(30), nullable=False, server_default='UNVERIFIED'),

        # Data Provenance Flag
        # CITIZEN REPORTED → VERIFIED INCIDENT
        sa.Column('data_status', sa.String(30), nullable=False, server_default='CITIZEN REPORTED'),

        # Priority for Operations Dispatch
        # STANDARD, ELEVATED, CRITICAL
        sa.Column('priority', sa.String(20), nullable=False, server_default='STANDARD'),

        # Crew & Action Tracking
        sa.Column('assigned_crew', sa.String(150), nullable=True),
        sa.Column('action_taken', sa.Text(), nullable=True),

        # Spam / Duplicate Cluster Detection
        sa.Column('is_duplicate_flag', sa.Boolean(), nullable=False, server_default='0'),
        sa.Column('cluster_ref_id', sa.String(50), nullable=True),

        # Audit Timestamps
        sa.Column(
            'created_at',
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
        sa.Column(
            'updated_at',
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("CURRENT_TIMESTAMP"),
            onupdate=sa.text("CURRENT_TIMESTAMP"),
        ),
    )

    # Performance Indexes
    op.create_index('ix_citizen_complaints_id', 'citizen_complaints', ['id'])
    op.create_index('ix_citizen_complaints_complaint_id', 'citizen_complaints', ['complaint_id'], unique=True)
    op.create_index('ix_citizen_complaints_status', 'citizen_complaints', ['status'])
    op.create_index('ix_citizen_complaints_area', 'citizen_complaints', ['area'])
    op.create_index('ix_citizen_complaints_created_at', 'citizen_complaints', ['created_at'])
    op.create_index('ix_citizen_complaints_severity', 'citizen_complaints', ['severity'])
    op.create_index('ix_citizen_complaints_verification_status', 'citizen_complaints', ['verification_status'])


def downgrade() -> None:
    """Drop the citizen_complaints table and all its indexes."""
    op.drop_index('ix_citizen_complaints_verification_status', table_name='citizen_complaints')
    op.drop_index('ix_citizen_complaints_severity', table_name='citizen_complaints')
    op.drop_index('ix_citizen_complaints_created_at', table_name='citizen_complaints')
    op.drop_index('ix_citizen_complaints_area', table_name='citizen_complaints')
    op.drop_index('ix_citizen_complaints_status', table_name='citizen_complaints')
    op.drop_index('ix_citizen_complaints_complaint_id', table_name='citizen_complaints')
    op.drop_index('ix_citizen_complaints_id', table_name='citizen_complaints')
    op.drop_table('citizen_complaints')
