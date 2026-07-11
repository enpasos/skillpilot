package com.skillpilot.backend.curriculumpackage;

public class CurriculumPackageException extends IllegalStateException {

    public CurriculumPackageException(String message) {
        super(message);
    }

    public CurriculumPackageException(String message, Throwable cause) {
        super(message, cause);
    }
}
