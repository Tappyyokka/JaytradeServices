import os
from pathlib import Path
import secrets
import sys
from urllib.parse import urlsplit

from dotenv import dotenv_values


def main():
    command, jaytrade = sys.argv[1:3]
    directory = Path(jaytrade).resolve()
    isolated = dotenv_values(Path(__file__).resolve().parents[1] / ".env.phase2.local")
    database = urlsplit(isolated["JAYTRADE_DEMO_DATABASE_URL"])
    if (database.hostname not in {"localhost", "127.0.0.1", "::1"} or
            database.path != "/jaytrade_registration_phase2" or database.username != "jaytrade_phase2_app"):
        raise RuntimeError("Unexpected isolated Jaytrade database")
    if os.environ.get("RENDER") or "production" in {os.environ.get("FLASK_ENV"), os.environ.get("NODE_ENV")}:
        raise RuntimeError("Demo launch is local development only")
    os.environ.update(
        DATABASE_URL=isolated["JAYTRADE_DEMO_DATABASE_URL"],
        INDIPAY_REGISTRATION_TRACKING="1",
        INDIPAY_REGISTRATION_DEMO="0",
        INDIPAY_SERVICE_PROCESSING="1",
        INDIPAY_COMPANY_BILLS="1",
        INDIPAY_REGISTRATION_DEMO_ISOLATION=isolated["INDIPAY_REGISTRATION_DEMO_ISOLATION"],
        INDIPAY_API_KEY=isolated["INDIPAY_API_KEY"],
        SECRET_KEY=isolated["SECRET_KEY"],
    )
    os.chdir(directory)
    sys.path.insert(0, str(directory))

    from app import app
    from extensions import db
    from flask_migrate import upgrade
    from indipay_registration import registration_demo_isolation_matches
    from models import Employee, IndipayRegistration, Lead, Service

    app.config["INDIPAY_REGISTRATION_DEMO_LOCAL"] = True
    app.config["JAYTRADE_BILL_STORAGE"] = Path(app.instance_path) / "phase2-private-bills"
    app.config["CUSTOMER_FILES_FOLDER"] = Path(app.instance_path) / "phase2-private-attachments"
    with app.app_context():
        if not registration_demo_isolation_matches():
            raise RuntimeError("Isolated database attestation failed")
        if command == "migrate":
            upgrade()
            return
        if command == "attachments":
            from models import CustomerFile
            from private_attachments import attachment_inventory
            from sqlalchemy import select
            names = db.session.execute(select(CustomerFile.stored_filename)).scalars()
            print(attachment_inventory(app.config["CUSTOMER_FILES_FOLDER"], names))
            return
        if command == "reconcile":
            from import_services import import_services
            from registered_services import reconcile_registered_services
            if not Service.query.count():
                import_services()
            print(f"Registered customers created: {reconcile_registered_services()}")
            return
        if command == "seed":
            ids = ("IND-PHASE2-REG-001", "IND-PHASE2-REG-002")
            if Lead.query.filter(Lead.external_id.in_(ids)).count() == len(ids):
                print("Synthetic Jaytrade applications already exist.")
                return
            if Lead.query.count() or Employee.query.count():
                raise RuntimeError("Expected empty isolated lead and staff tables")
            worker = Employee(
                employee_code="PHASE2-EMPLOYEE", full_name="Phase 2 Employee",
                email="phase2-employee@example.invalid", role="employee", department="Finance",
                is_active=True, is_approved=True,
            )
            worker.set_password(secrets.token_urlsafe(32))
            db.session.add(worker)
            for application_id in ids:
                lead = Lead(
                    external_id=application_id, name="Phase 2 Synthetic Customer",
                    source="Indipay", service="Personal Loan", status="Moved to Quick Action",
                    department="Finance", assigned_employee=worker,
                )
                db.session.add(lead)
                db.session.add(IndipayRegistration(
                    lead=lead, stage="primary_approval", amount_paise=300000,
                    service=lead.service, department=lead.department, staff=worker.full_name,
                ))
            db.session.commit()
            print("Created two synthetic Primary Approval records in isolated Jaytrade.")
            return
        if command != "serve":
            raise RuntimeError("Use migrate, reconcile, attachments, seed or serve")
    app.config["CUSTOMER_FILES_FOLDER"].mkdir(mode=0o700, parents=True, exist_ok=True)
    app.run(host="127.0.0.1", port=5011, debug=False, use_reloader=False)


if __name__ == "__main__":
    main()
