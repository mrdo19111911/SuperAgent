#!/usr/bin/env python3
"""
CSV Schema Validator (Decision 2A)
Validates METADATA.yaml routing table structure

Author: Nash Agent Framework
Date: 2026-03-17
"""

import sys
import yaml
from typing import Dict, List, Any

class SchemaError(Exception):
    """Raised when CSV schema validation fails"""
    pass

REQUIRED_ROUTING_FIELDS = [
    "audit_signal",
    "pipeline",
    "priority",
    "thesis_agents",
    "anti_thesis_agents",
    "synthesis_agent"
]

REQUIRED_SCORING_FIELDS = [
    "event",
    "severity",
    "points",
    "multiplier",
    "evidence_required"
]

VALID_PRIORITIES = ["P0", "P1", "P2", "P3", "P4"]
VALID_SEVERITIES = ["P0", "P1", "P2", "P3", "P4"]
VALID_MULTIPLIERS = ["M1", "M2", "M3", "none"]

def validate_routing_table(routing_table: List[Dict[str, Any]], schema_version: str):
    """Validate routing table structure"""

    if not routing_table:
        raise SchemaError("Routing table is empty")

    for idx, entry in enumerate(routing_table):
        # Check required fields
        for field in REQUIRED_ROUTING_FIELDS:
            if field not in entry:
                raise SchemaError(
                    f"Routing entry {idx}: Missing required field '{field}'"
                )

        # Validate priority
        if entry["priority"] not in VALID_PRIORITIES:
            raise SchemaError(
                f"Routing entry {idx}: Invalid priority '{entry['priority']}', "
                f"must be one of {VALID_PRIORITIES}"
            )

        # Validate agents are lists
        for agent_field in ["thesis_agents", "anti_thesis_agents"]:
            if not isinstance(entry[agent_field], list):
                raise SchemaError(
                    f"Routing entry {idx}: '{agent_field}' must be a list"
                )

        # Validate synthesis_agent is string
        if not isinstance(entry["synthesis_agent"], str):
            raise SchemaError(
                f"Routing entry {idx}: 'synthesis_agent' must be a string"
            )

    print(f"✓ Routing table validated: {len(routing_table)} entries")

def validate_scoring_matrix(scoring_matrix: List[Dict[str, Any]], schema_version: str):
    """Validate scoring matrix structure"""

    if not scoring_matrix:
        raise SchemaError("Scoring matrix is empty")

    for idx, entry in enumerate(scoring_matrix):
        # Check required fields
        for field in REQUIRED_SCORING_FIELDS:
            if field not in entry:
                raise SchemaError(
                    f"Scoring entry {idx}: Missing required field '{field}'"
                )

        # Validate severity
        if entry["severity"] not in VALID_SEVERITIES:
            raise SchemaError(
                f"Scoring entry {idx}: Invalid severity '{entry['severity']}', "
                f"must be one of {VALID_SEVERITIES}"
            )

        # Validate multiplier
        if entry["multiplier"] not in VALID_MULTIPLIERS:
            raise SchemaError(
                f"Scoring entry {idx}: Invalid multiplier '{entry['multiplier']}', "
                f"must be one of {VALID_MULTIPLIERS}"
            )

        # Validate points is integer
        if not isinstance(entry["points"], int):
            raise SchemaError(
                f"Scoring entry {idx}: 'points' must be an integer"
            )

    print(f"✓ Scoring matrix validated: {len(scoring_matrix)} entries")

def validate_metadata_yaml(filepath: str):
    """Main validation entry point"""

    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = yaml.safe_load(f)
    except FileNotFoundError:
        raise SchemaError(f"File not found: {filepath}")
    except yaml.YAMLError as e:
        raise SchemaError(f"YAML parsing error: {e}")

    # Check schema version
    if "schema_version" not in data:
        raise SchemaError("Missing 'schema_version' field")

    schema_version = data["schema_version"]

    if schema_version != "2.0":
        raise SchemaError(
            f"Unsupported schema version '{schema_version}', expected '2.0'"
        )

    print(f"✓ Schema version: {schema_version}")

    # Validate routing table
    if "routing_table" in data:
        validate_routing_table(data["routing_table"], schema_version)

    # Validate scoring matrix
    if "scoring_matrix" in data:
        validate_scoring_matrix(data["scoring_matrix"], schema_version)

    # Validate pipeline registry
    if "pipeline_registry" in data:
        if not isinstance(data["pipeline_registry"], list):
            raise SchemaError("'pipeline_registry' must be a list")
        print(f"✓ Pipeline registry: {len(data['pipeline_registry'])} pipelines")

    # Validate agent registry
    if "agent_registry" in data:
        if not isinstance(data["agent_registry"], list):
            raise SchemaError("'agent_registry' must be a list")
        print(f"✓ Agent registry: {len(data['agent_registry'])} agents")

    print(f"\n✓ METADATA.yaml validation PASSED")

if __name__ == "__main__":
    # Fix Windows encoding
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

    if len(sys.argv) < 2:
        print("Usage: python validate_csv_schema.py <path_to_METADATA.yaml>")
        sys.exit(1)

    try:
        validate_metadata_yaml(sys.argv[1])
        sys.exit(0)
    except SchemaError as e:
        print(f"✗ VALIDATION FAILED: {e}", file=sys.stderr)
        sys.exit(1)
